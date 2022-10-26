const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  userId: { type: String, require: true },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

module.exports = mongoose.model("token", tokenSchema);
