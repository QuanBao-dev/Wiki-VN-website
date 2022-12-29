const mongoose = require("mongoose");
const coffeeSchema = new mongoose.Schema({
  type: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  fromName: {
    type: String,
    require: true,
  },
  url: {
    type: String,
    default: "",
  },
  becomingMemberAt: {
    type: Date,
  },
  becomingSupporterAt: {
    type: Date,
  },
  tierName: {
    type: String,
    default:""
  },
});

module.exports = mongoose.model("coffee", coffeeSchema);
