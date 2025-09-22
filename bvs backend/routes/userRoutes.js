const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.put(
  '/profile',
  authenticate,
  [body('name').notEmpty().withMessage('Name is required')],
  userController.updateProfile
);

// Change password
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  userController.changePassword
);

module.exports = router;