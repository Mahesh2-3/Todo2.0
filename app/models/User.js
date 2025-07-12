const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  profileImage: String
});

// ✅ Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema, "Users");

module.exports = User;

