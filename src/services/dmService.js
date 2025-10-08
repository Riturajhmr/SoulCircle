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
  limit
} from '../firebase';

// Create or get existing DM conversation between two users
export const getOrCreateDM = async (userId1, userId2) => {
  try {
    // Create a consistent conversation ID regardless of user order
    const conversationId = [userId1, userId2].sort().join('_');
    const dmRef = doc(db, 'dms', conversationId);
    const dmSnap = await getDoc(dmRef);
    
    if (dmSnap.exists()) {
      return { id: conversationId, ...dmSnap.data() };
    }
    
    // Create new DM conversation
    const dmData = {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: null,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0
      }
    };
    
    await setDoc(dmRef, dmData);
    return { id: conversationId, ...dmData };
  } catch (error) {
    console.error('❌ Error creating DM:', error);
    throw error;
  }
};

// Get all DM conversations for a user
export const getUserDMs = async (userId) => {
  try {
    const dmsRef = collection(db, 'dms');
    const q = query(
      dmsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessage.timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const dms = [];
    
    snapshot.forEach((doc) => {
      dms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return dms;
  } catch (error) {
    console.error('❌ Error getting DMs:', error);
    throw error;
  }
};

// Send a DM message
export const sendDM = async (conversationId, messageData) => {
  try {
    const messagesRef = collection(db, 'dms', conversationId, 'messages');
    const message = {
      ...messageData,
      timestamp: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(messagesRef, message);
    
    // Update conversation's last message
    const dmRef = doc(db, 'dms', conversationId);
    await setDoc(dmRef, {
      lastMessage: {
        text: messageData.text,
        senderId: messageData.senderId,
        timestamp: serverTimestamp()
      }
    }, { merge: true });
    
    // Increment unread count for recipient
    const dmSnap = await getDoc(dmRef);
    if (dmSnap.exists()) {
      const data = dmSnap.data();
      const recipientId = data.participants.find(id => id !== messageData.senderId);
      const currentUnread = data.unreadCount?.[recipientId] || 0;
      
      await setDoc(dmRef, {
        unreadCount: {
          ...data.unreadCount,
          [recipientId]: currentUnread + 1
        }
      }, { merge: true });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending DM:', error);
    throw error;
  }
};

// Get messages in a DM conversation
export const getDMMessages = async (conversationId, limitCount = 50) => {
  try {
    const messagesRef = collection(db, 'dms', conversationId, 'messages');
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
    console.error('❌ Error getting DM messages:', error);
    throw error;
  }
};

// Real-time DM messages listener
export const listenToDMMessages = (conversationId, callback, limitCount = 50) => {
  try {
    const messagesRef = collection(db, 'dms', conversationId, 'messages');
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
    console.error('❌ Error setting up DM listener:', error);
    throw error;
  }
};

// Real-time DM list listener
export const listenToUserDMs = (userId, callback) => {
  try {
    const dmsRef = collection(db, 'dms');
    const q = query(
      dmsRef,
      where('participants', 'array-contains', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const dms = [];
      querySnapshot.forEach((doc) => {
        dms.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by last message timestamp
      dms.sort((a, b) => {
        const aTime = a.lastMessage?.timestamp?.seconds || 0;
        const bTime = b.lastMessage?.timestamp?.seconds || 0;
        return bTime - aTime;
      });
      
      callback(dms);
    });
  } catch (error) {
    console.error('❌ Error setting up DMs listener:', error);
    throw error;
  }
};

// Mark messages as read
export const markDMAsRead = async (conversationId, userId) => {
  try {
    const dmRef = doc(db, 'dms', conversationId);
    await setDoc(dmRef, {
      unreadCount: {
        [userId]: 0
      }
    }, { merge: true });
  } catch (error) {
    console.error('❌ Error marking DM as read:', error);
    throw error;
  }
};

// Get other user in conversation
export const getOtherUser = (conversation, currentUserId) => {
  return conversation.participants?.find(id => id !== currentUserId);
};



