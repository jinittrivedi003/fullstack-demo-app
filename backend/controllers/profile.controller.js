const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updatePersonalDetails = async (req, res) => {
  try {
    const { fullName, dateOfBirth, email, mobileNumber, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.personalDetails.fullName = fullName || user.personalDetails.fullName;
    user.personalDetails.dateOfBirth = dateOfBirth || user.personalDetails.dateOfBirth;
    user.personalDetails.email = email || user.personalDetails.email;
    user.personalDetails.mobileNumber = mobileNumber || user.personalDetails.mobileNumber;
    user.personalDetails.address = address || user.personalDetails.address;

    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      user.personalDetails.attachments.push(...newAttachments);
    }

    await user.save();
    const updated = await User.findById(req.user.id).select('-password');
    res.json({ message: 'Personal details saved successfully.', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const attachment = user.personalDetails.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    user.personalDetails.attachments.pull(req.params.attachmentId);
    await user.save();
    res.json({ message: 'Attachment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
