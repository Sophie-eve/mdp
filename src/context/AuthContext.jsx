import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInUser, 
  signUpUser, 
  signOutUser, 
  getCurrentSession, 
  onAuthStateChange 
} from '../services/authService';
import { isSupabaseConfigured, getSupabaseConfig } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [guestPreviewMode, setGuestPreviewMode] = useState(false);

  const config = getSupabaseConfig();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { session: currentSession, error } = await getCurrentSession();
        if (error) {
          console.warn('Session retrieval note:', error.message);
        }
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { subscription } = onAuthStateChange((event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    setLoading(true);
    const { data, error } = await signInUser(email, password);
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    let cachedProfile = {};
    try {
      cachedProfile = JSON.parse(localStorage.getItem('aquasense_user_profile') || '{}');
    } catch (e) {}

    const enhancedUser = {
      ...data.user,
      full_name: data.user?.user_metadata?.full_name || cachedProfile.full_name || email.split('@')[0],
      phone_number: data.user?.user_metadata?.phone_number || cachedProfile.phone_number || '+91 98765 43210',
    };
    setUser(enhancedUser);
    setSession(data.session);
    return { success: true };
  };

  const signup = async (params) => {
    setAuthError(null);
    setLoading(true);

    const email = typeof params === 'object' ? params.email : arguments[0];
    const password = typeof params === 'object' ? params.password : arguments[1];
    const fullName = typeof params === 'object' ? params.fullName : (arguments[2] || '');
    const phoneNumber = typeof params === 'object' ? params.phoneNumber : (arguments[3] || '');
    const smsAlertsEnabled = typeof params === 'object' ? (params.smsAlertsEnabled ?? true) : true;

    const { data, error } = await signUpUser({
      email,
      password,
      fullName,
      phoneNumber,
      smsAlertsEnabled,
    });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    // Cache profile in localStorage for instant retrieval across sessions
    const profile = {
      email,
      full_name: fullName || email.split('@')[0],
      phone_number: phoneNumber || '+91 98765 43210',
      sms_alerts_enabled: smsAlertsEnabled,
    };
    try {
      localStorage.setItem('aquasense_user_profile', JSON.stringify(profile));
    } catch (e) {}

    const requiresVerification = !data?.session;
    if (data?.user) {
      setUser({
        ...data.user,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
      });
    }
    if (data?.session) {
      setSession(data.session);
    }

    return { 
      success: true, 
      requiresVerification,
      user: data?.user,
      message: requiresVerification 
        ? 'Account registered! Verification email sent (if required by Supabase). You may also sign in or explore the dashboard.'
        : 'Account created and signed in successfully!'
    };
  };

  const logout = async () => {
    setLoading(true);
    await signOutUser();
    setUser(null);
    setSession(null);
    setGuestPreviewMode(false);
    setLoading(false);
  };

  // Quick instant login with demo credentials or guest exploration
  const enterGuestPreview = (customName, customPhone) => {
    let cachedProfile = {};
    try {
      cachedProfile = JSON.parse(localStorage.getItem('aquasense_user_profile') || '{}');
    } catch (e) {}

    const demoUser = {
      id: 'active-session-' + Date.now().toString(36),
      email: cachedProfile.email || 'shailja.singh@gmail.com',
      full_name: customName || cachedProfile.full_name || 'Shailja Singh',
      phone_number: customPhone || cachedProfile.phone_number || '+91 98765 43210',
      user_metadata: {
        full_name: customName || cachedProfile.full_name || 'Shailja Singh',
        phone_number: customPhone || cachedProfile.phone_number || '+91 98765 43210',
      }
    };
    setUser(demoUser);
    setGuestPreviewMode(true);
  };

  const exitGuestPreview = () => {
    setGuestPreviewMode(false);
    setUser(null);
  };

  // Get current active user object with fallback to stored profile
  const activeUser = user || (guestPreviewMode ? {
    id: 'guest-session',
    email: 'shailja.singh@gmail.com',
    full_name: 'Shailja Singh',
    phone_number: '+91 98765 43210',
    user_metadata: {
      full_name: 'Shailja Singh',
      phone_number: '+91 98765 43210',
    }
  } : null);

  const value = {
    user: activeUser,
    session,
    isAuthenticated: Boolean(activeUser),
    isGuestPreview: Boolean(guestPreviewMode && !session),
    loading,
    authError,
    clearAuthError: () => setAuthError(null),
    login,
    signup,
    logout,
    enterGuestPreview,
    exitGuestPreview,
    isConfigured: isSupabaseConfigured,
    config,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
