const User = require('../models/User');
const OTP = require('../models/OTP');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  storeRefreshToken,
  verifyRefreshToken,
  removeRefreshToken,
} = require('../services/tokenService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config/env');

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Create new user (not verified yet)
    const user = new User({ name, email, password });
    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: { userId: user._id }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP or expired' });
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });
    
    // Delete the OTP record
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// Forgot password - send reset OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email for password reset',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process forgot password request', error: error.message });
  }
};

// Reset password with OTP
const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP or expired' });
    }

    // Update password
    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();

    // Delete the OTP record
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token', error: error.message });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    // Remove refresh token
    await removeRefreshToken(refreshToken);

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPasswordWithOTP,
  refreshToken,
  logout,
};