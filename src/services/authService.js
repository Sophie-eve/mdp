import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Supabase Auth Service
 * Wraps Supabase Auth client methods for email/password authentication.
 */

export async function signUpUser(paramsOrEmail, maybePassword, maybeFullName, maybePhone, maybeSmsAlerts = true) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: null,
      error: { message: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.' },
    };
  }

  let email, password, fullName, phoneNumber, smsAlertsEnabled;
  if (typeof paramsOrEmail === 'object' && paramsOrEmail !== null) {
    email = paramsOrEmail.email;
    password = paramsOrEmail.password;
    fullName = paramsOrEmail.fullName;
    phoneNumber = paramsOrEmail.phoneNumber;
    smsAlertsEnabled = paramsOrEmail.smsAlertsEnabled ?? true;
  } else {
    email = paramsOrEmail;
    password = maybePassword;
    fullName = maybeFullName;
    phoneNumber = maybePhone;
    smsAlertsEnabled = maybeSmsAlerts;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          sms_alerts_enabled: smsAlertsEnabled,
        },
      },
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error creating account.' } };
  }
}

export async function signInUser(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: null,
      error: { message: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.' },
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error signing in.' } };
  }
}

export async function signOutUser() {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured || !supabase) {
    return { session: null, error: null };
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (err) {
    return { session: null, error };
  }
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured || !supabase) {
    return { subscription: { unsubscribe: () => {} } };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (typeof callback === 'function') {
        callback(event, session);
      }
    }
  );

  return { subscription };
}
