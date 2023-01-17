const patchModel = require("../models/patch.model");
const userModel = require("../models/user.model");
const router = require("express").Router();
router.get("/", async (req, res) => {
  try {
    const [users, mtledVNLength, releases] = await Promise.all([
      userModel.aggregate([{ $match: { isVerified: true, isNotSpam: true } }]),
      patchModel.countDocuments(),
      patchModel.aggregate([
        {
          $group: {
            _id: null,
            length: {
              $sum: { $size: "$shrinkMeLinkDownloads" },
            },
          },
        },
      ]),
    ]);
    res.send({
      message: {
        usersLength: users.length,
        mtledVNLength,
        releasesLength: releases[0].length,
      },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

module.exports = router;
