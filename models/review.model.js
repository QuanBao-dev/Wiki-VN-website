const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  stars: {
    type: Number,
    require: true,
  },
  review: {
    type: String,
    require: true,
  },
  userId: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("review", reviewSchema);
