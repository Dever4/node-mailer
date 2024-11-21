// File: server.js
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory storage for OTPs (use Redis for production)
const otpStorage = {};

// Helper function to send email
const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// API to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // Expires in 5 mins

  try {
    await sendEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

// API to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  const storedOtpData = otpStorage[email];

  if (!storedOtpData) {
    return res.status(400).json({ error: 'No OTP found for this email.' });
  }

  if (storedOtpData.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'OTP has expired.' });
  }

  if (storedOtpData.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP.' });
  }

  // OTP is valid
  delete otpStorage[email];
  res.status(200).json({ message: 'OTP verified successfully.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
