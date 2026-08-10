// Frontend Authentication Service connecting to local Express backend
export const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get standard auth headers with token
export function getAuthHeader() {
  const token = localStorage.getItem('hm_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const authService = {
  // 1. Sign Up Handler
  async signUp({ email, password, metadata }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, metadata })
      });

      const resData = await response.json();
      if (!response.ok) {
        return { data: null, error: { message: resData.error || 'Registration failed.' } };
      }

      // Save user to pending session for verification
      localStorage.setItem('hm_pending_verify_user', JSON.stringify(resData.user));
      return { data: resData.user, error: null };
    } catch (error) {
      console.error('Frontend signup error:', error);
      return { data: null, error: { message: 'Connection to backend failed. Make sure the backend server is running.' } };
    }
  },

  // 2. Sign In Handler
  async signIn({ email, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        if (resData.email_unverified) {
          // Save to pending session and trigger verification redirect
          localStorage.setItem('hm_pending_verify_user', JSON.stringify(resData.user));
          return { data: resData.user, error: { message: 'Email not verified', email_unverified: true } };
        }
        return { data: null, error: { message: resData.error || 'Authentication failed.' } };
      }

      // Save JWT token and active session user
      localStorage.setItem('hm_token', resData.token);
      localStorage.setItem('hm_session_user', JSON.stringify(resData.user));
      localStorage.setItem('hm_role', JSON.stringify(resData.user.role));

      return { data: resData.user, error: null };
    } catch (error) {
      console.error('Frontend signin error:', error);
      return { data: null, error: { message: 'Connection to backend failed. Make sure the backend server is running.' } };
    }
  },

  // 3. Resend Verification Email
  async resendVerificationEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const resData = await response.json();
      if (!response.ok) return { error: { message: resData.error || 'Failed to resend link.' } };
      return { error: null };
    } catch (error) {
      return { error: { message: 'Backend communication error.' } };
    }
  },

  // 4. Reset Password Request
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const resData = await response.json();
      if (!response.ok) return { error: { message: resData.error || 'Failed to send reset link.' } };
      return { error: null };
    } catch (error) {
      return { error: { message: 'Backend communication error.' } };
    }
  },

  // 5. Update / Reset Password
  async updatePassword(newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ password: newPassword })
      });
      const resData = await response.json();
      if (!response.ok) return { error: { message: resData.error || 'Failed to update password.' } };
      return { error: null };
    } catch (error) {
      return { error: { message: 'Backend communication error.' } };
    }
  },

  // 6. Sign Out
  async signOut() {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_session_user');
    localStorage.removeItem('hm_role');
  },

  // 7. Get Current Session User profile
  async getCurrentSessionUser() {
    const token = localStorage.getItem('hm_token');
    if (!token) {
      // Fallback check if user was saved in mock session
      const session = localStorage.getItem('hm_session_user');
      return session ? JSON.parse(session) : null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (!response.ok) {
        // Token expired/invalid, clear session
        localStorage.removeItem('hm_token');
        localStorage.removeItem('hm_session_user');
        localStorage.removeItem('hm_role');
        return null;
      }
      const resData = await response.json();
      localStorage.setItem('hm_session_user', JSON.stringify(resData.user));
      return resData.user;
    } catch (error) {
      console.warn('Backend offline. Using cached user session.');
      const session = localStorage.getItem('hm_session_user');
      return session ? JSON.parse(session) : null;
    }
  },

  // 8. Complete profile updates (First login)
  async completeUserProfile(userId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(updates)
      });

      const resData = await response.json();
      if (!response.ok) {
        return { data: null, error: { message: resData.error || 'Failed to update profile.' } };
      }

      // Update cached session
      localStorage.setItem('hm_session_user', JSON.stringify(resData.user));
      return { data: resData.user, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Backend communication error.' } };
    }
  },

  // 9. Verification email simulation trigger (sets verified = 1 in database)
  async mockVerifyEmail(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      const resData = await response.json();
      if (response.ok) {
        localStorage.removeItem('hm_pending_verify_user');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    }
  }
};
