const patchModel = require("../models/patch.model");
const userModel = require("../models/user.model");
const router = require("express").Router();
const validEmailSuffixes = [
  "@gmail.com",
  "@yahoo.com",
  "@hotmail.com",
  "@icloud.com",
  "@msn.com",
];
router.get("/", async (req, res) => {
  try {
    const [users, mtledVNLength, releases] = await Promise.all([
      userModel.find({}),
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
        usersLength: users.filter(({ email }) => isEmailValid(email)).length,
        mtledVNLength,
        releasesLength: releases[0].length,
      },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

function isEmailValid(email) {
  let check = false;
  validEmailSuffixes.forEach((suffix) => {
    if (email.match(new RegExp("(" + suffix + ")$", "g"))) {
      check = true;
    }
  });
  return check;
}

module.exports = router;
