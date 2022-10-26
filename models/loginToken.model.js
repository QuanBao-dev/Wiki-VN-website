const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  userId: { type: String, require: true },
  createdAt: {
    type: Number,
    default: Date.now,
  },
  accessTokenList: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("login-token", tokenSchema);
