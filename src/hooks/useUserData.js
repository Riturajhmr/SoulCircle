import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  getUserActivities, 
  getUserPreferences, 
  getUserDataSummary,
  addUserActivity,
  updateUserProfile,
  updateUserPreferences,
  listenToUserActivities,
  saveQuestionResponses,
  getQuestionResponses
} from '../services/userDataService';

export const useUserData = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [questionResponses, setQuestionResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data when user changes
  useEffect(() => {
    if (currentUser) {
      // Add a small delay to ensure Firestore operations are completed
      const timer = setTimeout(() => {
        loadUserData();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setUserProfile(null);
      setUserActivities([]);
      setUserPreferences({});
      setQuestionResponses(null);
      setLoading(false);
    }
  }, [currentUser]);

  const loadUserData = async (retryCount = 0) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserDataSummary(currentUser.uid);
      setUserProfile(data.profile);
      setUserActivities(data.recentActivities);
      setUserPreferences(data.preferences);
      setQuestionResponses(data.questionResponses);
    } catch (err) {
      console.error('Error loading user data:', err);
      
      // Retry once if it's a permissions error and we haven't retried yet
      if (err.message.includes('permissions') && retryCount < 1) {
        console.log('Retrying user data load...');
        setTimeout(() => loadUserData(retryCount + 1), 2000);
        return;
      }
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trackActivity = async (activityData) => {
    if (!currentUser) return;
    
    try {
      const activityId = await addUserActivity(currentUser.uid, activityData);
      // Refresh activities
      await loadUserData();
      return activityId;
    } catch (err) {
      console.error('Error tracking activity:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      await updateUserProfile(currentUser.uid, updates);
      await loadUserData(); // Refresh data
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  const updatePreferences = async (preferences) => {
    if (!currentUser) return;
    
    try {
      await updateUserPreferences(currentUser.uid, preferences);
      setUserPreferences(prev => ({ ...prev, ...preferences }));
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err.message);
      throw err;
    }
  };

  const saveResponses = async (responses) => {
    if (!currentUser) return;
    
    try {
      await saveQuestionResponses(currentUser.uid, responses);
      await loadUserData(); // Refresh data
    } catch (err) {
      console.error('Error saving responses:', err);
      setError(err.message);
      throw err;
    }
  };

  const refreshData = () => {
    if (currentUser) {
      loadUserData();
    }
  };

  return {
    userProfile,
    userActivities,
    userPreferences,
    questionResponses,
    loading,
    error,
    trackActivity,
    updateProfile,
    updatePreferences,
    saveResponses,
    refreshData
  };
};
