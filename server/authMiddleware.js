import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'homematch_secret_token_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token missing. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or has expired.' });
    }
    req.user = decodedUser;
    next();
  });
}

// Helper to authenticate optional tokens (e.g. public routes that can show custom results if logged in)
export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (!err) {
      req.user = decodedUser;
    }
    next();
  });
}
