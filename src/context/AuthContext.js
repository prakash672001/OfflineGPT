import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const API_BASE = 'https://offlinegpt.ai/api/auth';
const PROFILE_API = 'https://offlinegpt.ai/api/settings/profile';
const TRIAL_DAYS = 7;

// Field mapping:
// country → subscription status: "free", "trial", "lifetime_paid"
// city → trial start date (ISO) or purchase token

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenSubscription, setHasSeenSubscription] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free'); // "free", "trial", "trial_expired", "lifetime_paid"
  const [trialEndDate, setTrialEndDate] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Determine subscription status from user data
  const resolveSubscriptionStatus = (userData) => {
    if (!userData) return 'free';

    const status = userData.country; // "free", "trial", "lifetime_paid"
    const meta = userData.city; // trial start ISO or purchase token

    if (status === 'lifetime_paid') {
      return 'lifetime_paid';
    }

    if (status === 'trial' && meta) {
      const trialStart = new Date(meta);
      const trialEnd = new Date(trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      setTrialEndDate(trialEnd);

      if (new Date() < trialEnd) {
        return 'trial';
      } else {
        return 'trial_expired';
      }
    }

    return 'free';
  };

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const subSeen = await AsyncStorage.getItem('@seen_subscription');
      const localSubStatus = await AsyncStorage.getItem('@sub_status');

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Resolve subscription from server data
        const status = resolveSubscriptionStatus(parsedUser);
        setSubscriptionStatus(status);

        // Also check local override (for offline resilience)
        if (localSubStatus === 'lifetime_paid') {
          setSubscriptionStatus('lifetime_paid');
        }

        // Determine if user needs to see subscription screen
        if (subSeen === 'false' && status === 'free') {
          setHasSeenSubscription(false);
        } else if (status === 'trial_expired') {
          // Trial expired → must show paywall again
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

  // Start free trial → save to server + local
  const startFreeTrial = async () => {
    try {
      const trialStartDate = new Date().toISOString();

      // Update server via profile API
      const sessionCookie = await AsyncStorage.getItem('@session_cookie');
      if (sessionCookie) {
        try {
          await fetch(PROFILE_API, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': sessionCookie,
            },
            body: JSON.stringify({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              country: 'trial',
              city: trialStartDate,
            }),
          });
        } catch (apiError) {
          console.log('Profile API update failed (continuing locally):', apiError);
        }
      }

      // Save locally
      const updatedUser = { ...user, country: 'trial', city: trialStartDate };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('@sub_status', 'trial');
      await AsyncStorage.setItem('@trial_start', trialStartDate);
      setUser(updatedUser);

      const trialEnd = new Date(new Date(trialStartDate).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      setTrialEndDate(trialEnd);
      setSubscriptionStatus('trial');

      // Mark subscription as seen so user proceeds
      await markSubscriptionSeen();
    } catch (error) {
      console.log('Error starting free trial:', error);
      throw error;
    }
  };

  // Record lifetime purchase → save to server + local
  const recordLifetimePurchase = async (purchaseData = {}) => {
    try {
      const purchaseToken = purchaseData.purchaseToken || `manual_${Date.now()}`;

      // Update server via profile API
      const sessionCookie = await AsyncStorage.getItem('@session_cookie');
      if (sessionCookie) {
        try {
          await fetch(PROFILE_API, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': sessionCookie,
            },
            body: JSON.stringify({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              country: 'lifetime_paid',
              city: purchaseToken,
            }),
          });
        } catch (apiError) {
          console.log('Profile API update failed (continuing locally):', apiError);
        }
      }

      // Save locally
      const updatedUser = { ...user, country: 'lifetime_paid', city: purchaseToken };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('@sub_status', 'lifetime_paid');
      await AsyncStorage.setItem('@purchase_token', purchaseToken);
      setUser(updatedUser);
      setSubscriptionStatus('lifetime_paid');

      // Mark subscription as seen so user proceeds
      await markSubscriptionSeen();
    } catch (error) {
      console.log('Error recording purchase:', error);
      throw error;
    }
  };

  // Check if user has active access (trial or paid)
  const hasActiveAccess = () => {
    return subscriptionStatus === 'trial' || subscriptionStatus === 'lifetime_paid';
  };

  // Check if trial is expired
  const isTrialExpired = () => {
    return subscriptionStatus === 'trial_expired';
  };

  // Get remaining trial days
  const getRemainingTrialDays = () => {
    if (subscriptionStatus !== 'trial' || !trialEndDate) return 0;
    const remaining = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
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

    // Save session cookie for profile API calls
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      await AsyncStorage.setItem('@session_cookie', setCookieHeader);
    }

    // Save user data locally
    const userData = data.user;
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);

    // Resolve subscription from the server data
    const status = resolveSubscriptionStatus(userData);
    setSubscriptionStatus(status);

    // If user already paid or is in active trial → skip subscription screen
    if (status === 'lifetime_paid' || status === 'trial') {
      await AsyncStorage.setItem('@seen_subscription', 'true');
      setHasSeenSubscription(true);
    } else {
      // New user or trial expired → show subscription screen
      await AsyncStorage.setItem('@seen_subscription', 'false');
      setHasSeenSubscription(false);
    }

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
      await AsyncStorage.removeItem('@session_cookie');
      setUser(null);
      setIsAuthenticated(false);
      setSubscriptionStatus('free');
      setTrialEndDate(null);
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
        subscriptionStatus,
        trialEndDate,
        signUp,
        login,
        resendVerification,
        signOut,
        updateProfile,
        markSubscriptionSeen,
        startFreeTrial,
        recordLifetimePurchase,
        hasActiveAccess,
        isTrialExpired,
        getRemainingTrialDays,
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
