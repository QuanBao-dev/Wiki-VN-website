const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  userId: {
    type:String,
    require:true
  },
  message:{
    type:String,
    require:true
  },
  title:{
    type:String,
    require: true
  }
});

module.exports = mongoose.model("notification",notificationSchema);