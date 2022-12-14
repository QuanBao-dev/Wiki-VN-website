const express = require("express");
const { verifyRole } = require("../middlewares/verifyRole");
const chatTextModel = require("../models/chatText.model");
const router = express.Router();

router.get("/", verifyRole("Admin", "Member"), async (req, res) => {
  let page = req.query.page || 1;
  try {
    const chatTexts = await chatTextModel.aggregate([
      {
        $group: {
          _id: { $toDate: "$createdAt" },
          text: { $first: "$text" },
          userId: { $first: "$userId" },
          createdAt: { $first: "$createdAt" },
        },
      },
      { $sort: { _id: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "users",
        },
      },
      { $sort: { createdAt: 1 } },
      { $project: { text: 1, createdAt: 1, users: 1, _id: 0 } },
    ]);
    if (chatTexts.length === 0)
      return res.status(400).send({
        error: "Reached the last page",
      });
    res.send({
      message: chatTexts.map(({ text, createdAt, users, boost }) => {
        return {
          text,
          createdAt,
          user: {
            username: users[0].username,
            role: users[0].role,
            avatarImage: users[0].avatarImage,
            boost: boost || 1,
          },
        };
      }),
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

module.exports = router;
