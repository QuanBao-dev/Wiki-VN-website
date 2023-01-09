const { verifyRole } = require("../middlewares/verifyRole");
const roomChatModel = require("../models/roomChat.model");

const router = require("express").Router();

router.get("/", verifyRole("Admin","Member"), async (req, res) => {
  try {
    const roomList = await roomChatModel
      .find({})
      .select({
        roomName: 1,
        _id: 0,
        roles: 1,
      })
      .lean();
    res.send({ message: roomList });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/", verifyRole("Admin"), async (req, res) => {
  const { roles, roomName } = req.body;
  try {
    let room = await roomChatModel.findOne({ roomName });
    if (room) return res.status(400).send({ error: "Room existed" });
    if (!room) {
      room = new roomChatModel({
        roomName,
        roles,
      });
    }
    room.roomName = roomName;
    room.roles = roles;
    await room.save();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/:roomName", verifyRole("Admin"), async (req, res) => {
  const { roomName, roles } = req.body;
  try {
    const room = await roomChatModel.findOne({ roomName });
    room.roomName = roomName;
    room.roles = roles;
    await room.save();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
