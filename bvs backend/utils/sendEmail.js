// utils/sendEmail.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

console.log("📧 EMAIL from .env:", process.env.EMAIL);
console.log("🔐 NODEMAILER_PASSWORD length:", process.env.NODEMAILER_PASSWORD?.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

module.exports = async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
};
