const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory storage for OTPs (use a database for production)
const otpStorage = {};

const sendEmail = async (email, otp) => {
  console.log(`Creating transporter for ${email}`);
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    secure: true,
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

  try {
    console.log(`Sending mail to ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`Mail sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error); // Log error here
    throw new Error('Failed to send email');
  }
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
      console.log(`Sending OTP to ${email}...`);
      await sendEmail(email, otp);
      console.log(`OTP sent to ${email}: ${otp}`);
      res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
      console.error('Error sending OTP:', error); // Log error
      res.status(500).json({ error: 'Failed to send OTP.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

