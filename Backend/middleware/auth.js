// Simple auth middleware - uses header for demo
// In production, replace with JWT verification
const protect = async (req, res, next) => {
  try {
    // For demo purposes - use a fixed user ID
    // In production: verify JWT from Authorization header
    req.userId = req.headers['x-user-id'] || '507f1f77bcf86cd799439011';
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect };
