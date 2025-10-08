import { 
  db, 
  doc, 
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from '../firebase';

// Room Member Management
export const inviteToRoom = async (roomId, userId, invitedBy) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) throw new Error('Room not found');
    
    const roomData = roomSnap.data();
    const inviterRole = roomData.members?.[invitedBy];
    
    // Only owner/mod can invite
    if (inviterRole !== 'owner' && inviterRole !== 'mod') {
      throw new Error('Only owners and moderators can invite members');
    }
    
    // Check if user is banned
    if (roomData.bannedUsers?.includes(userId)) {
      throw new Error('This user is banned from the room');
    }
    
    // Add user as member
    const updatedMembers = { ...roomData.members, [userId]: 'member' };
    await updateDoc(roomRef, {
      members: updatedMembers,
      memberCount: Object.keys(updatedMembers).length
    });
  } catch (error) {
    console.error('❌ Error inviting to room:', error);
    throw error;
  }
};

export const removeFromRoom = async (roomId, userId, removedBy) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) throw new Error('Room not found');
    
    const roomData = roomSnap.data();
    const removerRole = roomData.members?.[removedBy];
    const targetRole = roomData.members?.[userId];
    
    // Only owner/mod can remove
    if (removerRole !== 'owner' && removerRole !== 'mod') {
      throw new Error('Only owners and moderators can remove members');
    }
    
    // Can't remove owner
    if (targetRole === 'owner') {
      throw new Error('Cannot remove room owner');
    }
    
    // Mods can't remove mods
    if (removerRole === 'mod' && targetRole === 'mod') {
      throw new Error('Moderators cannot remove other moderators');
    }
    
    const updatedMembers = { ...roomData.members };
    delete updatedMembers[userId];
    
    await updateDoc(roomRef, {
      members: updatedMembers,
      memberCount: Object.keys(updatedMembers).length
    });
  } catch (error) {
    console.error('❌ Error removing from room:', error);
    throw error;
  }
};

export const banUser = async (roomId, userId, bannedBy) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) throw new Error('Room not found');
    
    const roomData = roomSnap.data();
    const bannerRole = roomData.members?.[bannedBy];
    const targetRole = roomData.members?.[userId];
    
    // Only owner/mod can ban
    if (bannerRole !== 'owner' && bannerRole !== 'mod') {
      throw new Error('Only owners and moderators can ban users');
    }
    
    // Can't ban owner
    if (targetRole === 'owner') {
      throw new Error('Cannot ban room owner');
    }
    
    // Mods can't ban mods
    if (bannerRole === 'mod' && targetRole === 'mod') {
      throw new Error('Moderators cannot ban other moderators');
    }
    
    // Remove from members and add to banned list
    const updatedMembers = { ...roomData.members };
    delete updatedMembers[userId];
    const updatedBanned = [...(roomData.bannedUsers || []), userId];
    
    await updateDoc(roomRef, {
      members: updatedMembers,
      bannedUsers: updatedBanned,
      memberCount: Object.keys(updatedMembers).length
    });
  } catch (error) {
    console.error('❌ Error banning user:', error);
    throw error;
  }
};

export const changeRole = async (roomId, userId, newRole, changedBy) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) throw new Error('Room not found');
    
    const roomData = roomSnap.data();
    const changerRole = roomData.members?.[changedBy];
    
    // Only owner can change roles
    if (changerRole !== 'owner') {
      throw new Error('Only the owner can change roles');
    }
    
    // Can't change owner role
    if (newRole === 'owner') {
      throw new Error('Cannot assign owner role');
    }
    
    const updatedMembers = { ...roomData.members, [userId]: newRole };
    await updateDoc(roomRef, {
      members: updatedMembers
    });
  } catch (error) {
    console.error('❌ Error changing role:', error);
    throw error;
  }
};

export const joinRoomByCode = async (inviteCode, userId) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('inviteCode', '==', inviteCode), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) throw new Error('Invalid invite code');
    
    const roomDoc = snapshot.docs[0];
    const roomData = roomDoc.data();
    
    // Check if banned
    if (roomData.bannedUsers?.includes(userId)) {
      throw new Error('You are banned from this room');
    }
    
    // Check if already a member
    if (roomData.members?.[userId]) {
      throw new Error('You are already a member');
    }
    
    // Add as member
    const updatedMembers = { ...roomData.members, [userId]: 'member' };
    await updateDoc(doc(db, 'rooms', roomDoc.id), {
      members: updatedMembers,
      memberCount: Object.keys(updatedMembers).length
    });
    
    return { id: roomDoc.id, ...roomData };
  } catch (error) {
    console.error('❌ Error joining room:', error);
    throw error;
  }
};

export const getUserRole = (room, userId) => {
  return room?.members?.[userId] || null;
};

export const canModerate = (room, userId) => {
  const role = getUserRole(room, userId);
  return role === 'owner' || role === 'mod';
};

export const getRoleDisplay = (role) => {
  const roleMap = {
    owner: { label: '👑 Owner', color: 'text-yellow-400' },
    mod: { label: '🛡️ Mod', color: 'text-blue-400' },
    member: { label: '👤 Member', color: 'text-gray-400' }
  };
  return roleMap[role] || roleMap.member;
};



