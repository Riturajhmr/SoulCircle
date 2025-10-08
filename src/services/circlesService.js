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
  increment,
  arrayUnion,
  arrayRemove
} from '../firebase';

export const createCircle = async (circleData, creatorId, creatorName) => {
  try {
    const circlesRef = collection(db, 'supportCircles');
    
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Remove undefined values from circleData
    const cleanedData = {};
    Object.keys(circleData).forEach(key => {
      if (circleData[key] !== undefined && circleData[key] !== null) {
        cleanedData[key] = circleData[key];
      }
    });
    
    const circle = {
      ...cleanedData,
      members: [creatorId],
      memberCount: 1,
      createdBy: creatorId,
      creatorName: creatorName || 'Anonymous',
      inviteCode: inviteCode,
      isUserCreated: true,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(circlesRef, circle);
    
    const memberRef = doc(db, 'supportCircles', docRef.id, 'memberDetails', creatorId);
    await setDoc(memberRef, {
      userId: creatorId,
      userName: creatorName || 'Anonymous',
      joinedAt: serverTimestamp(),
      isActive: true,
      isCreator: true
    });
    
    return { id: docRef.id, inviteCode };
  } catch (error) {
    console.error('❌ Error creating circle:', error);
    throw error;
  }
};

export const getAllCircles = async () => {
  try {
    const circlesRef = collection(db, 'supportCircles');
    
    const querySnapshot = await getDocs(circlesRef);
    const circles = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        circles.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Sort in JavaScript instead of Firestore query
    circles.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // descending order
    });
    
    return circles;
  } catch (error) {
    console.error('❌ Error getting circles:', error);
    throw error;
  }
};

export const getCircleById = async (circleId) => {
  try {
    const circleRef = doc(db, 'supportCircles', circleId);
    const circleSnap = await getDoc(circleRef);
    
    if (circleSnap.exists()) {
      return { id: circleSnap.id, ...circleSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting circle:', error);
    throw error;
  }
};

export const joinCircle = async (circleId, userId, userName) => {
  try {
    const circleRef = doc(db, 'supportCircles', circleId);
    const circleSnap = await getDoc(circleRef);
    
    if (!circleSnap.exists()) {
      throw new Error('Circle not found');
    }
    
    const circleData = circleSnap.data();
    
    if (circleData.memberCount >= circleData.maxMembers) {
      throw new Error('Circle is full');
    }
    
    if (circleData.members && circleData.members.includes(userId)) {
      throw new Error('Already a member of this circle');
    }
    
    await setDoc(circleRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    const memberRef = doc(db, 'supportCircles', circleId, 'memberDetails', userId);
    await setDoc(memberRef, {
      userId,
      userName: userName || 'Anonymous',
      joinedAt: serverTimestamp(),
      isActive: true
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error joining circle:', error);
    throw error;
  }
};

export const leaveCircle = async (circleId, userId) => {
  try {
    const circleRef = doc(db, 'supportCircles', circleId);
    
    await setDoc(circleRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    const memberRef = doc(db, 'supportCircles', circleId, 'memberDetails', userId);
    await setDoc(memberRef, {
      isActive: false,
      leftAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('❌ Error leaving circle:', error);
    throw error;
  }
};

export const getUserCircles = async (userId) => {
  try {
    const allCircles = await getAllCircles();
    
    const userCircles = allCircles.filter(circle => 
      circle.members && circle.members.includes(userId)
    );
    
    return userCircles;
  } catch (error) {
    console.error('❌ Error getting user circles:', error);
    throw error;
  }
};

export const listenToCircles = (callback) => {
  try {
    const circlesRef = collection(db, 'supportCircles');
    
    return onSnapshot(circlesRef, (querySnapshot) => {
      const circles = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isDeleted) {
          circles.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // Sort in JavaScript instead of Firestore query
      circles.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // descending order
      });
      
      callback(circles);
    }, (error) => {
      console.error('❌ Error in circles listener:', error);
      callback([]); // Return empty array on error
    });
  } catch (error) {
    console.error('❌ Error setting up circles listener:', error);
    throw error;
  }
};

export const sendCircleMessage = async (circleId, messageData) => {
  try {
    const messagesRef = collection(db, 'supportCircles', circleId, 'messages');
    const message = {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(messagesRef, message);
    
    const circleRef = doc(db, 'supportCircles', circleId);
    await setDoc(circleRef, {
      lastMessage: {
        text: messageData.text,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        timestamp: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending circle message:', error);
    throw error;
  }
};

export const listenToCircleMessages = (circleId, callback) => {
  try {
    const messagesRef = collection(db, 'supportCircles', circleId, 'messages');
    
    return onSnapshot(messagesRef, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript instead of Firestore query
      messages.sort((a, b) => {
        const aTime = a.timestamp?.seconds || 0;
        const bTime = b.timestamp?.seconds || 0;
        return aTime - bTime; // ascending order (oldest first)
      });
      
      callback(messages);
    }, (error) => {
      console.error('❌ Error in circle messages listener:', error);
      callback([]); // Return empty array on error
    });
  } catch (error) {
    console.error('❌ Error setting up circle messages listener:', error);
    throw error;
  }
};

export const getCircleMembers = async (circleId) => {
  try {
    const membersRef = collection(db, 'supportCircles', circleId, 'memberDetails');
    
    const querySnapshot = await getDocs(membersRef);
    const members = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive) {
        members.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return members;
  } catch (error) {
    console.error('❌ Error getting circle members:', error);
    throw error;
  }
};

export const searchCircles = async (searchTerm) => {
  try {
    const circlesRef = collection(db, 'supportCircles');
    const snapshot = await getDocs(circlesRef);
    
    const circles = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const searchLower = searchTerm.toLowerCase();
      
      if (
        data.name.toLowerCase().includes(searchLower) ||
        data.description.toLowerCase().includes(searchLower) ||
        data.topic.toLowerCase().includes(searchLower) ||
        data.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      ) {
        circles.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return circles;
  } catch (error) {
    console.error('❌ Error searching circles:', error);
    throw error;
  }
};

export const joinCircleByInviteCode = async (inviteCode, userId, userName) => {
  try {
    const allCircles = await getAllCircles();
    
    const circle = allCircles.find(c => c.inviteCode === inviteCode);
    
    if (!circle) {
      throw new Error('Invalid invite code');
    }
    
    if (circle.memberCount >= circle.maxMembers) {
      throw new Error('Circle is full');
    }
    
    if (circle.members && circle.members.includes(userId)) {
      throw new Error('Already a member of this circle');
    }
    
    await joinCircle(circle.id, userId, userName);
    
    return circle;
  } catch (error) {
    console.error('❌ Error joining by invite code:', error);
    throw error;
  }
};

export const deleteCircle = async (circleId, userId) => {
  try {
    const circleRef = doc(db, 'supportCircles', circleId);
    const circleSnap = await getDoc(circleRef);
    
    if (!circleSnap.exists()) {
      throw new Error('Circle not found');
    }
    
    const circleData = circleSnap.data();
    
    if (circleData.createdBy !== userId) {
      throw new Error('Only the creator can delete this circle');
    }
    
    await setDoc(circleRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting circle:', error);
    throw error;
  }
};

export const updateCircle = async (circleId, userId, updates) => {
  try {
    const circleRef = doc(db, 'supportCircles', circleId);
    const circleSnap = await getDoc(circleRef);
    
    if (!circleSnap.exists()) {
      throw new Error('Circle not found');
    }
    
    const circleData = circleSnap.data();
    
    if (circleData.createdBy !== userId) {
      throw new Error('Only the creator can update this circle');
    }
    
    await setDoc(circleRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('❌ Error updating circle:', error);
    throw error;
  }
};

export const initializeDefaultCircles = async () => {
  try {
    const circlesRef = collection(db, 'supportCircles');
    const snapshot = await getDocs(circlesRef);
    
    if (snapshot.empty) {
      const defaultCircles = [
        {
          name: "Anxiety Warriors",
          description: "A safe space for those dealing with anxiety to share experiences and coping strategies.",
          topic: "Anxiety & Stress",
          maxMembers: 12,
          meetingTime: "7:00 PM",
          meetingDay: "Tuesdays",
          facilitator: "Sarah M.",
          nextMeeting: "Every Tuesday",
          tags: ["Anxiety", "Coping Skills", "Mindfulness"],
          color: "from-blue-500 to-cyan-500"
        },
        {
          name: "Healing Hearts",
          description: "For those navigating grief, loss, and the journey of healing after difficult life changes.",
          topic: "Grief & Loss",
          maxMembers: 10,
          meetingTime: "6:30 PM",
          meetingDay: "Thursdays",
          facilitator: "Michael R.",
          nextMeeting: "Every Thursday",
          tags: ["Grief", "Loss", "Healing", "Support"],
          color: "from-purple-500 to-pink-500"
        },
        {
          name: "New Beginnings",
          description: "Supporting each other through major life transitions and finding strength in change.",
          topic: "Life Transitions",
          maxMembers: 15,
          meetingTime: "8:00 PM",
          meetingDay: "Mondays",
          facilitator: "Emma L.",
          nextMeeting: "Every Monday",
          tags: ["Change", "Growth", "Resilience"],
          color: "from-green-500 to-teal-500"
        },
        {
          name: "Mindful Moments",
          description: "Practicing mindfulness and meditation together to find peace in daily life.",
          topic: "Mindfulness & Meditation",
          maxMembers: 20,
          meetingTime: "7:30 PM",
          meetingDay: "Wednesdays",
          facilitator: "David K.",
          nextMeeting: "Every Wednesday",
          tags: ["Mindfulness", "Meditation", "Peace"],
          color: "from-indigo-500 to-purple-500"
        },
        {
          name: "Young Adults Circle",
          description: "A supportive community for young adults (18-25) navigating the challenges of early adulthood.",
          topic: "Young Adult Support",
          maxMembers: 18,
          meetingTime: "9:00 PM",
          meetingDay: "Fridays",
          facilitator: "Alex T.",
          nextMeeting: "Every Friday",
          tags: ["Young Adults", "Life Skills", "Community"],
          color: "from-orange-500 to-red-500"
        },
        {
          name: "Creative Souls",
          description: "Using art, writing, and creativity as tools for healing and self-expression.",
          topic: "Creative Therapy",
          maxMembers: 12,
          meetingTime: "6:00 PM",
          meetingDay: "Saturdays",
          facilitator: "Luna P.",
          nextMeeting: "Every Saturday",
          tags: ["Creativity", "Art Therapy", "Expression"],
          color: "from-pink-500 to-rose-500"
        }
      ];
      
      for (const circle of defaultCircles) {
        const circlesRef = collection(db, 'supportCircles');
        const circleDoc = {
          ...circle,
          members: [],
          memberCount: 0,
          inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
          isUserCreated: false,
          isDeleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(circlesRef, circleDoc);
      }
      
      console.log('✅ Default circles initialized');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error initializing default circles:', error);
    throw error;
  }
};

