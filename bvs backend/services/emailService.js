const nodemailer = require('nodemailer');
const { NODEMAILER_EMAIL, NODEMAILER_PASSWORD, NODEMAILER_HOST } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: NODEMAILER_HOST,
  port: 587,
  secure: false,
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Busitron Dashboard" <${NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Your OTP for Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="background: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `http://yourfrontend.com/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Busitron Dashboard" <${NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>This link is valid for 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};