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
  collectionGroup
} from '../firebase';

// User-specific FeelNotes Management
export const saveUserFeelNote = async (userId, feelNoteData) => {
  try {
    const userFeelNotesRef = collection(db, 'users', userId, 'feelNotes');
    const feelNote = {
      ...feelNoteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAnonymous: true, // All FeelNotes are anonymous
      authorId: userId, // Store author ID for admin purposes only
      likes: 0,
      comments: 0
    };
    
    const docRef = await addDoc(userFeelNotesRef, feelNote);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving user FeelNote:', error);
    throw error;
  }
};

export const getUserFeelNotes = async (userId, limitCount = 50) => {
  try {
    const userFeelNotesRef = collection(db, 'users', userId, 'feelNotes');
    const q = query(
      userFeelNotesRef, 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const feelNotes = [];
    
    querySnapshot.forEach((doc) => {
      feelNotes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return feelNotes;
  } catch (error) {
    console.error('❌ Error getting user FeelNotes:', error);
    throw error;
  }
};

// Community FeelNotes Management (All users' notes)
export const getAllFeelNotes = async (limitCount = 100) => {
  try {
    // Collection group query across all users' feelNotes
    const cg = collectionGroup(db, 'feelNotes');
    const qAll = query(cg, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(qAll);
    const allFeelNotes = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      allFeelNotes.push({
        id: docSnap.id,
        ...data,
        authorId: undefined
      });
    });
    return allFeelNotes;
  } catch (error) {
    console.error('❌ Error getting all FeelNotes:', error);
    throw error;
  }
};

// Real-time listener for all FeelNotes
export const listenToAllFeelNotes = (callback, limitCount = 100) => {
  try {
    // This is a simplified version - in production, you might want to use a different approach
    // for real-time updates across all users' FeelNotes
    const checkForUpdates = async () => {
      const feelNotes = await getAllFeelNotes(limitCount);
      callback(feelNotes);
    };
    
    // Check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);
    
    // Initial load
    checkForUpdates();
    
    // Return cleanup function
    return () => clearInterval(interval);
  } catch (error) {
    console.error('❌ Error setting up FeelNotes listener:', error);
    throw error;
  }
};

// Like a FeelNote (anonymous)
export const likeFeelNote = async (userId, feelNoteId) => {
  try {
    const feelNoteRef = doc(db, 'users', userId, 'feelNotes', feelNoteId);
    const feelNoteSnap = await getDoc(feelNoteRef);
    
    if (feelNoteSnap.exists()) {
      const currentLikes = feelNoteSnap.data().likes || 0;
      await setDoc(feelNoteRef, {
        likes: currentLikes + 1
      }, { merge: true });
      
      return currentLikes + 1;
    }
    
    throw new Error('FeelNote not found');
  } catch (error) {
    console.error('❌ Error liking FeelNote:', error);
    throw error;
  }
};

// Get FeelNote statistics
export const getFeelNoteStats = async () => {
  try {
    const allFeelNotes = await getAllFeelNotes(1000); // Get more for stats
    
    const stats = {
      totalNotes: allFeelNotes.length,
      totalLikes: allFeelNotes.reduce((sum, note) => sum + (note.likes || 0), 0),
      recentNotes: allFeelNotes.filter(note => {
        const noteTime = note.createdAt?.seconds || 0;
        const oneDayAgo = Date.now() / 1000 - 86400; // 24 hours ago
        return noteTime > oneDayAgo;
      }).length
    };
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting FeelNote stats:', error);
    throw error;
  }
};
