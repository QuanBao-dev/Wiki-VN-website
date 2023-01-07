const mongoose = require("mongoose");

const chatTextSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  text: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("chatText", chatTextSchema);
