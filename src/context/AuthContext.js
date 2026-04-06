import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const API_BASE = 'https://offlinegpt.ai/api/auth';

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

  // Real API: Sign Up
  const signUp = async ({ name, email, password }) => {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    return data; // { message, userId, emailSent }
  };

  // Real API: Login
  const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Failed to login');
      error.status = response.status;
      throw error;
    }

    // Save user data locally
    const userData = data.user;
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);

    // New user who hasn't seen subscription yet
    await AsyncStorage.setItem('@seen_subscription', 'false');
    setHasSeenSubscription(false);

    return userData;
  };

  // Real API: Resend Verification Email
  const resendVerification = async (email) => {
    const response = await fetch(`${API_BASE}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend verification');
    }

    return data;
  };

  const signOut = async () => {
    try {
      // Call server logout to destroy session
      await fetch(`${API_BASE}/logout`, { method: 'POST' });
    } catch (error) {
      console.log('Logout API error (continuing anyway):', error);
    }
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
        signUp,
        login,
        resendVerification,
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
