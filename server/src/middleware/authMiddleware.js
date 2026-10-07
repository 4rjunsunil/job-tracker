import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'job-search-tracker-secret';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
