import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbConnection } from './database.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'homematch_secret_token_key_2026';

// 1. Sign Up Route
router.post('/signup', async (req, res) => {
  const { email, password, metadata } = req.body;

  if (!email || !password || !metadata || !metadata.full_name || !metadata.role) {
    return res.status(400).json({ error: 'Missing required signup fields.' });
  }

  const db = await getDbConnection();

  try {
    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM profiles WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      await db.close();
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

    // Insert profile
    await db.run(
      `INSERT INTO profiles (id, name, email, avatar, role, phone, city, language, email_verified, verification_status, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email.toLowerCase(), avatar, role, phone, city, language, emailVerified, verificationStatus, passwordHash]
    );

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
      verification_status: verificationStatus
    };

    await db.close();
    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Signup error:', error);
    await db.close();
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. Sign In Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const db = await getDbConnection();

  try {
    // Fetch profile
    const user = await db.get('SELECT * FROM profiles WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      await db.close();
      return res.status(401).json({ error: 'Invalid email or password. Account not found.' });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      await db.close();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if email is verified
    if (user.email_verified === 0) {
      await db.close();
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

    await db.close();
    return res.json({ token, user: userProfile });
  } catch (error) {
    console.error('Signin error:', error);
    await db.close();
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 3. Resend Verification Email route (mocked notification trigger)
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  // In a real application, you would send an email here.
  // For this local backend, we return success.
  return res.json({ success: true, message: 'Verification link resent.' });
});

// 4. Reset Password Request (mocked)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const db = await getDbConnection();
  try {
    const user = await db.get('SELECT id FROM profiles WHERE email = ?', [email.toLowerCase()]);
    await db.close();
    if (!user) {
      return res.status(404).json({ error: 'Account with this email does not exist.' });
    }
    return res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    await db.close();
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. Update Password Route (authenticated)
router.post('/update-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'New password is required.' });

  const db = await getDbConnection();
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    await db.run('UPDATE profiles SET password_hash = ? WHERE id = ?', [passwordHash, req.user.id]);
    await db.close();
    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    await db.close();
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// 6. Get Current User profile
router.get('/me', authenticateToken, async (req, res) => {
  const db = await getDbConnection();
  try {
    const user = await db.get('SELECT id, name, email, avatar, role, phone, city, language, verification_status FROM profiles WHERE id = ?', [req.user.id]);
    await db.close();
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.json({ user });
  } catch (error) {
    await db.close();
    return res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
});

// 7. Complete User Profile Update
router.post('/complete-profile', authenticateToken, async (req, res) => {
  const updates = req.body; // e.g. name, phone, city, language, avatar
  const db = await getDbConnection();

  try {
    // Generate valid update fields
    const validFields = ['name', 'phone', 'city', 'language', 'avatar'];
    const updateClauses = [];
    const params = [];

    for (const key of validFields) {
      if (updates[key] !== undefined) {
        updateClauses.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (updateClauses.length === 0) {
      await db.close();
      return res.status(400).json({ error: 'No valid update fields provided.' });
    }

    params.push(req.user.id);
    await db.run(`UPDATE profiles SET ${updateClauses.join(', ')} WHERE id = ?`, params);

    const updatedUser = await db.get('SELECT id, name, email, avatar, role, phone, city, language, verification_status FROM profiles WHERE id = ?', [req.user.id]);
    await db.close();
    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Complete profile error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to complete user profile.' });
  }
});

// 8. Verification Email Simulation (activates user in database)
router.post('/verify', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  const db = await getDbConnection();
  try {
    const result = await db.run('UPDATE profiles SET email_verified = 1 WHERE id = ?', [userId]);
    await db.close();
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    await db.close();
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

export default router;
