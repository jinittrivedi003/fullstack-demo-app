const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const attachmentSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
});

const personalDetailsSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  dateOfBirth: { type: Date },
  email: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  attachments: [attachmentSchema]
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true },
  personalDetails: { type: personalDetailsSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
