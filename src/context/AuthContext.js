import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenSubscription, setHasSeenSubscription] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const subSeen = await AsyncStorage.getItem('@seen_subscription');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        if (subSeen === 'false') {
          setHasSeenSubscription(false);
        } else {
          setHasSeenSubscription(true);
        }
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markSubscriptionSeen = async () => {
    try {
      await AsyncStorage.setItem('@seen_subscription', 'true');
      setHasSeenSubscription(true);
    } catch (error) {
      console.log('Error marking seen:', error);
    }
  };

  const signIn = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.log('Error signing in:', error);
      return false;
    }
  };

  const signInWithCredentials = async ({ email, password, name, isNewUser }) => {
    const mockUser = {
      id: 'local_user_' + Date.now(),
      email,
      name: isNewUser ? name : 'User',
      photo: null,
      provider: 'local',
    };
    
    // Set subscription flag: false if new user, true if login
    if (isNewUser) {
      await AsyncStorage.setItem('@seen_subscription', 'false');
      setHasSeenSubscription(false);
    } else {
      await AsyncStorage.setItem('@seen_subscription', 'true');
      setHasSeenSubscription(true);
    }
    
    return signIn(mockUser);
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Error updating profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        hasSeenSubscription,
        signIn,
        signInWithCredentials,
        signOut,
        updateProfile,
        markSubscriptionSeen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
