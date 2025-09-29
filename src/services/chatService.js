import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  limit,
  updateDoc,
  deleteDoc,
  rtdb
} from '../firebase';
import { ref, set, onDisconnect, remove, onValue, off } from 'firebase/database';

// Room Management
export const createRoom = async (roomData) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const room = {
      ...roomData,
      createdAt: serverTimestamp(),
      lastMessage: null,
      memberCount: 1,
      isActive: true
    };
    
    const docRef = await addDoc(roomsRef, room);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating room:', error);
    throw error;
  }
};

export const getAllRooms = async (limitCount = 50) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const q = query(
      roomsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const rooms = [];
    
    querySnapshot.forEach((doc) => {
      const roomData = doc.data();
      // Filter active rooms on client side
      if (roomData.isActive !== false) {
        rooms.push({
          id: doc.id,
          ...roomData
        });
      }
    });
    
    return rooms;
  } catch (error) {
    console.error('❌ Error getting rooms:', error);
    throw error;
  }
};

export const getRoom = async (roomId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      return { id: roomSnap.id, ...roomSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting room:', error);
    throw error;
  }
};

export const updateRoom = async (roomId, updates) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ Error updating room:', error);
    throw error;
  }
};

// Soft delete (archive) a room by owner
export const archiveRoom = async (roomId, currentUserId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) throw new Error('Room not found');
    const data = snap.data();
    if (data.createdBy !== currentUserId) {
      throw new Error('Only the room creator can delete this room');
    }
    await updateDoc(roomRef, {
      isActive: false,
      archivedAt: serverTimestamp(),
      archivedBy: currentUserId
    });
  } catch (error) {
    console.error('❌ Error archiving room:', error);
    throw error;
  }
};

// Message Management
export const sendMessage = async (roomId, messageData) => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const message = {
      ...messageData,
      timestamp: serverTimestamp(),
      edited: false,
      deleted: false,
      reactions: {}
    };
    
    const docRef = await addDoc(messagesRef, message);
    
    // Update room's last message
    await updateRoom(roomId, {
      lastMessage: {
        text: messageData.text,
        senderName: messageData.senderName,
        timestamp: message.timestamp
      }
    });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (roomId, limitCount = 50) => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    throw error;
  }
};

// Real-time message listener
export const listenToMessages = (roomId, callback, limitCount = 50) => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(messages.reverse()); // Return in chronological order
    });
  } catch (error) {
    console.error('❌ Error setting up message listener:', error);
    throw error;
  }
};

// Real-time room list listener
export const listenToRooms = (callback, limitCount = 50) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const q = query(
      roomsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const rooms = [];
    querySnapshot.forEach((doc) => {
      const roomData = doc.data();
      // Filter active rooms on client side
      if (roomData.isActive !== false) {
        rooms.push({
          id: doc.id,
          ...roomData
        });
      }
    });
    callback(rooms);
    });
  } catch (error) {
    console.error('❌ Error setting up rooms listener:', error);
    throw error;
  }
};

// Presence Management (Realtime Database)
export const setUserOnline = async (userId, userData, currentRoom = null) => {
  try {
    const userStatusRef = ref(rtdb, `status/${userId}`);
    await set(userStatusRef, {
      online: true,
      lastSeen: Date.now(),
      currentRoom: currentRoom,
      ...userData
    });
    
    // Set offline on disconnect
    onDisconnect(userStatusRef).set({
      online: false,
      lastSeen: Date.now()
    });
  } catch (error) {
    console.error('❌ Error setting user online:', error);
    throw error;
  }
};

export const setUserOffline = async (userId) => {
  try {
    const userStatusRef = ref(rtdb, `status/${userId}`);
    await set(userStatusRef, {
      online: false,
      lastSeen: Date.now()
    });
  } catch (error) {
    console.error('❌ Error setting user offline:', error);
    throw error;
  }
};

export const listenToPresence = (callback) => {
  try {
    const statusRef = ref(rtdb, 'status');
    return onValue(statusRef, (snapshot) => {
      const presence = snapshot.val() || {};
      callback(presence);
    });
  } catch (error) {
    console.error('❌ Error setting up presence listener:', error);
    throw error;
  }
};

// Typing Indicators
export const setTyping = async (roomId, userId, isTyping = true) => {
  try {
    const typingRef = ref(rtdb, `typing/${roomId}/${userId}`);
    if (isTyping) {
      await set(typingRef, true);
      // Auto-clear after 3 seconds
      setTimeout(() => {
        remove(typingRef);
      }, 3000);
    } else {
      await remove(typingRef);
    }
  } catch (error) {
    console.error('❌ Error setting typing status:', error);
    throw error;
  }
};

export const listenToTyping = (roomId, callback) => {
  try {
    const typingRef = ref(rtdb, `typing/${roomId}`);
    return onValue(typingRef, (snapshot) => {
      const typing = snapshot.val() || {};
      callback(typing);
    });
  } catch (error) {
    console.error('❌ Error setting up typing listener:', error);
    throw error;
  }
};

// Message Reactions
export const addReaction = async (roomId, messageId, userId, emoji) => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (messageSnap.exists()) {
      const currentReactions = messageSnap.data().reactions || {};
      currentReactions[userId] = emoji;
      
      await updateDoc(messageRef, {
        reactions: currentReactions
      });
    }
  } catch (error) {
    console.error('❌ Error adding reaction:', error);
    throw error;
  }
};

export const removeReaction = async (roomId, messageId, userId) => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (messageSnap.exists()) {
      const currentReactions = messageSnap.data().reactions || {};
      delete currentReactions[userId];
      
      await updateDoc(messageRef, {
        reactions: currentReactions
      });
    }
  } catch (error) {
    console.error('❌ Error removing reaction:', error);
    throw error;
  }
};

// Message Management
export const editMessage = async (roomId, messageId, newText) => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    await updateDoc(messageRef, {
      text: newText,
      edited: true,
      editedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ Error editing message:', error);
    throw error;
  }
};

export const deleteMessage = async (roomId, messageId) => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    await updateDoc(messageRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error;
  }
};

// Utility Functions
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const messageTime = timestamp.seconds ? 
    new Date(timestamp.seconds * 1000) : 
    new Date(timestamp);
  
  const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return messageTime.toLocaleDateString();
};

export const getOnlineUsers = (presence) => {
  return Object.entries(presence)
    .filter(([_, user]) => user.online)
    .map(([userId, user]) => ({ userId, ...user }));
};

export const getTypingUsers = (typing, currentUserId) => {
  return Object.entries(typing)
    .filter(([userId, _]) => userId !== currentUserId)
    .map(([userId, _]) => userId);
};
