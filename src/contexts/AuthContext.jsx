import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from '../firebase';
import { createUserProfile, updateUserProfile, addUserActivity, getUserProfile } from '../services/userDataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      
      // Step 1: Create user with Firebase Auth only
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user && displayName) {
        // Step 2: Update profile
        await updateProfile(result.user, { displayName });
      }
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      
      // Step 1: Sign in with Firebase Auth only
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          setCurrentUser(user);
          setLoading(false);
          
          // Handle Firestore operations when user is authenticated
          if (user) {
            try {
              // Check if user profile exists, if not create it
              const existingProfile = await getUserProfile(user.uid);
              
              if (!existingProfile) {
                await createUserProfile(user.uid, {
                  displayName: user.displayName || 'User',
                  email: user.email,
                  photoURL: user.photoURL || null
                });
              }
              
              // Add login activity
              await addUserActivity(user.uid, {
                type: 'user_login',
                description: 'User logged in',
                metadata: {
                  email: user.email,
                  loginTime: new Date().toISOString()
                }
              });
              
              // Update last login time
              await updateUserProfile(user.uid, {
                lastLoginAt: new Date().toISOString()
              });
              
            } catch (firestoreError) {
              console.error('Firestore setup error (non-blocking):', firestoreError);
            }
          }
        });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    error,
    clearError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
