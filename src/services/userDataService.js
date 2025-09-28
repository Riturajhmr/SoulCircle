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
  serverTimestamp
} from '../firebase';

// User Profile Management
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const profileData = {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true
    };
    
    await setDoc(userRef, profileData);
    return profileData;
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...updates,
      lastUpdatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, updateData, { merge: true });
    return updateData;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    throw error;
  }
};

// User Activities Management
export const addUserActivity = async (userId, activityData) => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const activity = {
      ...activityData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(activitiesRef, activity);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding activity:', error);
    throw error;
  }
};

export const getUserActivities = async (userId, limit = 50) => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const q = query(
      activitiesRef, 
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return activities.slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting activities:', error);
    throw error;
  }
};

// Real-time listener for user activities
export const listenToUserActivities = (userId, callback) => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const q = query(activitiesRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const activities = [];
      querySnapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(activities);
    });
  } catch (error) {
    console.error('❌ Error setting up activities listener:', error);
    throw error;
  }
};

// User Preferences Management
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId, 'preferences', 'settings');
    const preferenceData = {
      ...preferences,
      lastUpdatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, preferenceData, { merge: true });
    return preferenceData;
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    throw error;
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId, 'preferences', 'settings');
    const prefSnap = await getDoc(userRef);
    
    if (prefSnap.exists()) {
      return prefSnap.data();
    } else {
      return {};
    }
  } catch (error) {
    console.error('❌ Error getting preferences:', error);
    throw error;
  }
};

// Question Responses Management
export const saveQuestionResponses = async (userId, responses) => {
  try {
    const responsesRef = doc(db, 'users', userId, 'data', 'questionResponses');
    const responseData = {
      responses,
      completedAt: serverTimestamp(),
      totalQuestions: Object.keys(responses).length,
      lastUpdatedAt: serverTimestamp()
    };
    
    await setDoc(responsesRef, responseData, { merge: true });
    return responseData;
  } catch (error) {
    console.error('❌ Error saving question responses:', error);
    throw error;
  }
};

export const getQuestionResponses = async (userId) => {
  try {
    const responsesRef = doc(db, 'users', userId, 'data', 'questionResponses');
    const responsesSnap = await getDoc(responsesRef);
    
    if (responsesSnap.exists()) {
      return responsesSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting question responses:', error);
    throw error;
  }
};

// User Data Summary
export const getUserDataSummary = async (userId) => {
  try {
    const [profile, activities, preferences, questionResponses] = await Promise.all([
      getUserProfile(userId),
      getUserActivities(userId, 10), // Last 10 activities
      getUserPreferences(userId),
      getQuestionResponses(userId)
    ]);
    
    return {
      profile,
      recentActivities: activities,
      preferences,
      questionResponses
    };
  } catch (error) {
    console.error('❌ Error getting user data summary:', error);
    throw error;
  }
};
