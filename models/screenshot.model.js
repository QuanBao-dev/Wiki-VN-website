const mongoose = require("mongoose");
const screenshotSchema = new mongoose.Schema({
  items:{
    type:[String],
    default:[]
  },
})

module.exports = mongoose.model("screenshot", screenshotSchema);