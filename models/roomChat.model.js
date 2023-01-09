const mongoose= require("mongoose");

const roomChatModel = new mongoose.Schema({
  roles:{
    type:[String],
    default:["User","Admin","Member","Supporter"]
  },
  roomName:{
    type:String,
    require: true
  },
})

module.exports = mongoose.model("roomChat",roomChatModel)