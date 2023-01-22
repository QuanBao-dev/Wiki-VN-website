const mongoose = require("mongoose");

const voteSchema = mongoose.Schema({
  vnId: {
    type: Number,
    require: true,
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
    default:"",
  },
});

module.exports = mongoose.model("vote", voteSchema);
