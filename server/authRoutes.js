import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from './dbStore.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'homematch_secret_token_key_2026';

// 1. Sign Up Route
router.post('/signup', async (req, res) => {
  const { email, password, metadata } = req.body;

  if (!email || !password || !metadata || !metadata.full_name || !metadata.role) {
    return res.status(400).json({ error: 'Missing required signup fields.' });
  }

  try {
    // Check if user already exists
    const existingUser = dbStore.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const userId = `usr-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const role = metadata.role;
    const name = metadata.full_name;
    const phone = metadata.phone || null;
    const city = metadata.city || null;
    const language = metadata.language || 'English';
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    const emailVerified = 0; // Starts unverified
    const verificationStatus = role === 'owner' ? 'pending' : 'verified';

    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      avatar,
      role,
      phone,
      city,
      language,
      email_verified: emailVerified,
      verification_status: verificationStatus,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };

    dbStore.profiles.push(newUser);

    // Return profile without password hash
    const userProfile = { ...newUser };
    delete userProfile.password_hash;

    return res.status(201).json({ user: userProfile });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. Sign In Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  try {
    // Fetch profile
    const user = dbStore.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Account not found.' });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if email is verified
    if (user.email_verified === 0) {
      return res.status(400).json({ 
        error: 'Email address has not been verified yet.', 
        email_unverified: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      city: user.city,
      language: user.language,
      verification_status: user.verification_status
    };

    return res.json({ token, user: userProfile });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 3. Resend Verification Email route (mocked notification trigger)
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  return res.json({ success: true, message: 'Verification link resent.' });
});

// 4. Reset Password Request
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = dbStore.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Account with this email does not exist.' });
    }
    return res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. Update Password Route (authenticated)
router.post('/update-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'New password is required.' });

  try {
    const user = dbStore.profiles.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.password_hash = bcrypt.hashSync(password, 10);
    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// 6. Get Current User profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = dbStore.profiles.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      city: user.city,
      language: user.language,
      verification_status: user.verification_status
    };
    return res.json({ user: userProfile });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
});

// 7. Complete User Profile Update
router.post('/complete-profile', authenticateToken, async (req, res) => {
  const updates = req.body; // e.g. name, phone, city, language, avatar
  try {
    const user = dbStore.profiles.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const validFields = ['name', 'phone', 'city', 'language', 'avatar'];
    let updated = false;

    for (const key of validFields) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
        updated = true;
      }
    }

    if (!updated) {
      return res.status(400).json({ error: 'No valid update fields provided.' });
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      city: user.city,
      language: user.language,
      verification_status: user.verification_status
    };

    return res.json({ user: userProfile });
  } catch (error) {
    console.error('Complete profile error:', error);
    return res.status(500).json({ error: 'Failed to complete user profile.' });
  }
});

// 8. Verification Email Simulation (activates user in database)
router.post('/verify', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const user = dbStore.profiles.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.email_verified = 1;
    return res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

// 9. Google OAuth Simulation Route
router.post('/google-login', async (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing Google profile information.' });
  }

  try {
    let user = dbStore.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Register new user from Google
      const userId = `usr-google-${Date.now()}`;
      const avatarUrl = avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
      const passwordHash = bcrypt.hashSync('google-oauth-dummy-hash', 10);

      user = {
        id: userId,
        name,
        email: email.toLowerCase(),
        avatar: avatarUrl,
        role: 'user',
        phone: null,
        city: null,
        language: 'English',
        email_verified: 1,
        verification_status: 'verified',
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      };
      dbStore.profiles.push(user);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      city: user.city,
      language: user.language,
      verification_status: user.verification_status
    };

    return res.json({ token, user: userProfile });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ error: 'Internal server error during Google login.' });
  }
});

export default router;
