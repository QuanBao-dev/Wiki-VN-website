const patchModel = require("../models/patch.model");
const userModel = require("../models/user.model");
const router = require("express").Router();
router.get("/", async (req, res) => {
  const isMemberOnly = req.query.isMemberOnly === "true";
  try {
    const [users, mtledVNLength, releases, mtledVNLength2] = await Promise.all([
      userModel.aggregate([{ $match: { isVerified: true, isNotSpam: true } }]),
      patchModel.aggregate([
        {
          $match: !isMemberOnly
            ? { $or: [{ isMemberOnly: false }, { isMemberOnly: undefined }] }
            : {},
        },
        {
          $group: {
            _id: null,
            length: {
              $sum: 1,
            },
          },
        },
      ]),
      patchModel.aggregate([
        {
          $group: {
            _id: null,
            length: {
              $sum: { $size: "$originalLinkDownloads" },
            },
          },
        },
      ]),
      patchModel.countDocuments(),
    ]);
    res.send({
      message: {
        usersLength: users.length,
        mtledVNLength: mtledVNLength[0].length,
        releasesLength: releases[0].length,
        mtledVNLength2,
      },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

module.exports = router;
