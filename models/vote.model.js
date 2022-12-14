const mongoose = require("mongoose");

const voteSchema = mongoose.Schema({
  vnId: {
    type: Number,
    require: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  isTranslatable: {
    type: Boolean,
    default: true,
  },
  dataVN: {
    type: Map,
    default: {},
  },
  reason: {
    type: String,
  },
});

module.exports = mongoose.model("vote", voteSchema);
