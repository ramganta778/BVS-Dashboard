const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = require('../config/env');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const storeRefreshToken = async (userId, token) => {
  try {
    await Token.create({ userId, token });
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const storedToken = await Token.findOne({ userId: decoded.userId, token });
    
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }
    
    return decoded;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw error;
  }
};

const removeRefreshToken = async (token) => {
  try {
    await Token.deleteOne({ token });
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  removeRefreshToken,
};