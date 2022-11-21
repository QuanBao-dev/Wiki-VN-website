const { nanoid } = require("nanoid");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    default: () => nanoid(20),
  },
  username: { type: String, require: true },
  password: { type: String, require: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: "User" },
  email: {
    type: String,
    required: true,
  },
  avatarImage: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  votedVnIdList: {
    type: [Number],
    default: [],
  },
  isFreeAds: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("user", userSchema);
