module.exports = (req, res) => {
  if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
