const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory storage for OTPs (use a database for production)
const otpStorage = {};

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
      user: 'lexiscarl9@gmail.com',
      pass: 'isaac1986$',
    },
  });

  const mailOptions = {
    from: 'lexiscarl9@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = async (req, res) => {
  if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
