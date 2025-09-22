const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication token missing' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
};