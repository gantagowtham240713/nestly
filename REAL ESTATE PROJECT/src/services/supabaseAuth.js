import { supabase } from './supabaseClient';

export const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthHeader() {
  const token = localStorage.getItem('hm_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Map Supabase errors to simple user-friendly messages
function mapAuthError(error) {
  if (!error) return null;
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.code;

  if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429) {
    return { message: 'Too many attempts. Please wait a moment and try again.' };
  }
  if (msg.includes('invalid credentials') || msg.includes('invalid login credentials')) {
    return { message: 'Incorrect password. Please try again.' };
  }
  if (msg.includes('user not found') || msg.includes('no user found') || msg.includes('invalid email or password')) {
    return { message: 'Account not found. Please sign up first.' };
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('already registered') ||
    msg.includes('user_already_exists') ||
    msg.includes('already exists') ||
    msg.includes('email already in use')
  ) {
    return { message: 'Email already exists. Please login instead.', already_exists: true };
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate email')) {
    return { message: 'Please enter a valid email address.' };
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return { message: 'Network error. Please check your connection and try again.' };
  }
  if (msg.includes('password') && msg.includes('characters')) {
    return { message: 'Password must be at least 6 characters.' };
  }
  // Supabase returns this when email confirmations are still enabled
  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return {
      message: 'Email confirmation is enabled on your Supabase project. Please disable it in Supabase Dashboard → Authentication → Providers → Email → turn off "Confirm email".',
      config_error: true
    };
  }
  return { message: error.message || 'Authentication error. Please try again.' };
}

// Build a clean user object from Supabase auth user + profile row
function buildUserObject(authUser, profile) {
  const role = profile?.role || authUser.user_metadata?.role || 'user';
  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'User',
    email: authUser.email,
    avatar:
      profile?.avatar ||
      authUser.user_metadata?.avatar_url ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(authUser.id)}`,
    role,
    phone: profile?.phone || authUser.user_metadata?.phone || null,
    city: profile?.city || authUser.user_metadata?.city || null,
    language: authUser.user_metadata?.preferred_language || 'English',
    verification_status: role === 'owner' ? (profile?.verification_status || 'pending') : 'verified'
  };
}

// Save session data to localStorage
function saveSession(user, session) {
  localStorage.setItem('hm_session_user', JSON.stringify(user));
  localStorage.setItem('hm_role', JSON.stringify(user.role));
  if (session?.access_token) {
    localStorage.setItem('hm_token', session.access_token);
  }
}

export const authService = {

  // ─── 1. SIGN UP ────────────────────────────────────────────────────────────
  // Simple email + password sign-up.
  // Requires "Confirm email" to be DISABLED in Supabase Dashboard.
  // → Authentication → Providers → Email → Toggle off "Confirm email"
  // When disabled, signUp returns a session immediately — no email sent.
  async signUp({ email, password, metadata }) {
    try {
      const fullName = (metadata?.full_name || 'User').trim();
      const role     = metadata?.role     || 'user';
      const phone    = metadata?.phone    || '';
      const city     = metadata?.city     || '';
      const language = metadata?.language || 'English';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name:               fullName,
            full_name:          fullName,
            phone,
            city,
            preferred_language: language,
            role,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`
          }
          // No emailRedirectTo — keeps Supabase from sending confirmation emails
        }
      });

      if (error) {
        return { data: null, error: mapAuthError(error) };
      }

      // If Supabase still has email confirmation enabled, session will be null
      if (!data.session) {
        return {
          data: null,
          error: {
            message:
              'Your Supabase project has "Confirm email" enabled. Please disable it: ' +
              'Supabase Dashboard → Authentication → Providers → Email → turn off "Confirm email". ' +
              'Then try again.',
            config_error: true
          }
        };
      }

      // Upsert profile row (safe even if a DB trigger already created it)
      await supabase.from('profiles').upsert(
        {
          id:     data.user.id,
          name:   fullName,
          email:  data.user.email,
          role,
          phone:  phone  || null,
          city:   city   || null,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
          verification_status: role === 'owner' ? 'pending' : 'verified'
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      // Fetch the profile back (in case a DB trigger added fields)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const finalUser = buildUserObject(data.user, profile);
      saveSession(finalUser, data.session);

      return { data: finalUser, error: null };
    } catch (err) {
      console.error('signUp error:', err);
      return { data: null, error: mapAuthError(err) };
    }
  },

  // ─── 2. SIGN IN ────────────────────────────────────────────────────────────
  // Simple email + password login. No OTP, no email sending.
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        // Detect "account not found" vs "wrong password"
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('invalid login credentials')) {
          // Supabase returns same message for both wrong password and non-existent user.
          // We show a safe generic message:
          return { data: null, error: { message: 'Incorrect email or password. Please try again.' } };
        }
        return { data: null, error: mapAuthError(error) };
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const finalUser = buildUserObject(data.user, profile);
      saveSession(finalUser, data.session);

      return { data: finalUser, error: null };
    } catch (err) {
      console.error('signIn error:', err);
      return { data: null, error: mapAuthError(err) };
    }
  },

  // ─── 3. PASSWORD RESET ─────────────────────────────────────────────────────
  async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      return { error: error ? mapAuthError(error) : null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  },

  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? mapAuthError(error) : null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  },

  // ─── 4. SIGN OUT ───────────────────────────────────────────────────────────
  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('signOut error:', e);
    }
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_session_user');
    localStorage.removeItem('hm_role');
    localStorage.removeItem('hm_pending_verify_user');
  },

  // ─── 5. GET CURRENT SESSION USER ───────────────────────────────────────────
  async getCurrentSessionUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        localStorage.removeItem('hm_token');
        localStorage.removeItem('hm_session_user');
        localStorage.removeItem('hm_role');
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const finalUser = buildUserObject(session.user, profile);
      saveSession(finalUser, session);

      return finalUser;
    } catch (err) {
      console.warn('getCurrentSessionUser error:', err);
      const cached = localStorage.getItem('hm_session_user');
      return cached ? JSON.parse(cached) : null;
    }
  },

  // ─── 6. COMPLETE PROFILE ───────────────────────────────────────────────────
  async completeUserProfile(userId, updates) {
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: updates });
      if (authError) return { error: mapAuthError(authError) };

      const dbUpdates = {};
      if (updates.name)       dbUpdates.name   = updates.name;
      if (updates.avatar_url) dbUpdates.avatar  = updates.avatar_url;
      if (updates.role)       dbUpdates.role    = updates.role;

      if (Object.keys(dbUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', userId);
        if (profileError) return { error: mapAuthError(profileError) };
      }

      await this.getCurrentSessionUser();
      return { error: null };
    } catch (err) {
      console.error('completeUserProfile error:', err);
      return { error: mapAuthError(err) };
    }
  }
};
