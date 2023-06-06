const { default: mongoose } = require("mongoose");
const { verifyRole } = require("../middlewares/verifyRole");
const userModel = require("../models/user.model");
const voteModel = require("../models/vote.model");

const router = require("express").Router();
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page || 0);
  const isLowTier = req.query.isLowTier === "true";
  try {
    let votes = await voteModel.aggregate(
      [
        { $match: { isTranslatable: true } },
        { $sort: { votes: -1, vnId: 1 } },
        {
          $lookup: {
            from: "users",
            localField: "vnId",
            foreignField: "votedVnIdList",
            as: "votesData",
          },
        },
        {
          $project: {
            _id: 0,
            vnId: 1,
            votesData: {
              $filter: {
                input: "$votesData",
                cond: {
                  $and: [
                    { $gte: ["$$this.boost", 5] },
                    { $lte: ["$$this.boost", isLowTier ? 25 : 200] },
                  ],
                },
              },
            },
            isTranslatable: 1,
            dataVN: 1,
          },
        },
        {
          $project: {
            _id: 0,
            vnId: 1,
            votes: {
              $reduce: {
                input: "$votesData",
                initialValue: 0,
                in: { $sum: ["$$value", "$$this.boost"] },
              },
            },
            isTranslatable: 1,
            dataVN: 1,
          },
        },
        { $sort: { votes: -1, vnId: 1 } },
        { $skip: 10 * page },
        { $limit: 10 },
      ],
      {
        allowDiskUse: true,
      }
    );
    if (votes.filter((v) => v.votes !== 0).length === 0) {
      return res.status(400).send({ error: "It has reached its last page" });
    }
    res.send({
      message: votes
        .map((vote) => ({ ...vote.dataVN, votes: vote.votes }))
        .filter((v) => v.votes !== 0),
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get(
  "/personal/vns/",
  verifyRole("User", "Admin", "Member", "Supporter"),
  async (req, res) => {
    const { userId } = req.user;
    const page = req.query.page || 0;
    try {
      const { votedVnIdList } = await userModel
        .findOne({ userId })
        .select({ _id: 0, votedVnIdList: 1 })
        .lean();
      const votes = await voteModel
        .aggregate(
          [
            { $match: { vnId: { $in: votedVnIdList } } },
            { $sort: { votes: -1, vnId: 1 } },
            {
              $lookup: {
                from: "users",
                localField: "vnId",
                foreignField: "votedVnIdList",
                as: "votesData",
              },
            },
            {
              $project: {
                _id: 0,
                vnId: 1,
                votes: {
                  $reduce: {
                    input: "$votesData",
                    initialValue: 0,
                    in: { $sum: ["$$value", "$$this.boost"] },
                  },
                },
                isTranslatable: 1,
                dataVN: 1,
              },
            },
            { $skip: 10 * page },
            { $limit: 10 },
          ],
          {
            allowDiskUse: true,
          }
        )
        .allowDiskUse(true);
      if (votes.length === 0) {
        return res.status(400).send({ error: "It has reached its last page" });
      }
      res.send({
        message: votes.map((vote) => ({ ...vote.dataVN, votes: vote.votes })),
      });
    } catch (error) {
      if (error) return res.status(400).send({ error: error.message });
      return res.status(404).send({ error: "Something went wrong" });
    }
  }
);

router.get("/:vnId", async (req, res) => {
  const vnId = parseInt(req.params.vnId);
  const decode = jwt.decode(req.signedCookies.token, { json: true });
  try {
    if (!decode) {
      const [vote, voters] = await Promise.all([
        voteModel
          .findOne({ vnId })
          .select({
            _id: 0,
            vnId: 1,
            isTranslatable: 1,
            dataVN: 1,
            votes: 1,
            reason: 1,
          })
          .lean(),
        userModel.aggregate([
          {
            $match: {
              votedVnIdList: parseInt(vnId),
              isVerified: true,
              isNotSpam: true,
              boost: { $gte: 5 },
            },
          },
        ]),
      ]);
      const validUsersLength = voters.reduce((ans, curr) => {
        ans += curr.boost || 1;
        return ans;
      }, 0);
      return res.send({
        message: { ...vote, isIncreased: false, votes: validUsersLength },
      });
    }
    const [vote, user, voters] = await Promise.all([
      voteModel
        .findOne({ vnId })
        .select({
          _id: 0,
          vnId: 1,
          isTranslatable: 1,
          dataVN: 1,
          votes: 1,
          reason: 1,
        })
        .lean(),
      userModel
        .findOne({ userId: decode.userId })
        .select({ _id: 0, votedVnIdList: 1 })
        .lean(),
      userModel.aggregate([
        {
          $match: {
            votedVnIdList: parseInt(vnId),
            isVerified: true,
            isNotSpam: true,
            boost: { $gte: 5 },
          },
        },
      ]),
    ]);
    const validUsersLength = voters.reduce((ans, curr) => {
      if (!curr.boost || curr.boost === 1) return ans;
      ans += curr.boost;
      return ans;
    }, 0);

    let isIncreased = false;
    if (user && user.votedVnIdList) {
      if (user.votedVnIdList.includes(vnId)) isIncreased = true;
    }
    res.send({
      message: { ...vote, isIncreased, votes: validUsersLength },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/:vnId/translatable", verifyRole("Admin"), async (req, res) => {
  const { isTranslatable, dataVN, reason } = req.body;
  const { vnId } = req.params;
  try {
    let vote = await voteModel.findOne({ vnId });
    if (!vote) {
      vote = new voteModel({
        isTranslatable,
        vnId,
        dataVN,
      });
    }
    vote.isTranslatable = isTranslatable;
    vote.reason = reason.trim();
    await vote.save();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put(
  "/:vnId",
  verifyRole("Supporter", "Member", "Admin", "User"),
  async (req, res) => {
    const vnId = +req.params.vnId;
    let { dataVN, isDownVotes } = req.body;
    const { userId } = req.user;
    // isDownVotes = isDownVotes === "true";

    try {
      let [voteData, user] = await Promise.all([
        voteModel.findOne({ vnId }),
        userModel.findOne({ userId }),
      ]);
      // let isCoolDown;
      // const endCoolDownDate =
      //   new Date(user.votedVNsTranslatedAt).getTime() + 3600 * 1000 * 24 * 7;
      // if (user.votedVNsTranslatedAt) {
      //   isCoolDown = Date.now() < endCoolDownDate;
      // } else {
      //   isCoolDown = false;
      // }
      // if (isCoolDown) {
      //   return res.status(401).send({
      //     error: `You are in cool down mode. You will be able to vote again on ${new Date(
      //       endCoolDownDate
      //     ).toUTCString()}`,
      //   });
      // }
      if (voteData && voteData.isTranslatable === false) {
        return res.status(400).send({
          error: "This vn is not translatable or it's already been translated",
        });
      }
      if (!user.votedVnIdList || !user.votedVnIdList.includes(vnId)) {
        if (!voteData)
          voteData = new voteModel({
            vnId,
            dataVN,
          });
        if (!user.votedVnIdList) user.votedVnIdList = [];
      }
      let isIncreased = false;
      if (user && user.votedVnIdList) {
        if (user.votedVnIdList.includes(vnId)) isIncreased = true;
      }
      if (!isDownVotes) {
        if (!user.votedVnIdList.includes(vnId)) {
          user.votedVnIdList.push(vnId);
          // user.votedVnIdList = [vnId];
        }
      } else {
        if (isIncreased) {
          if (user.votedVnIdList.includes(vnId)) {
            user.votedVnIdList = user.votedVnIdList.filter(
              (vnIdData) => vnIdData !== vnId
            );
          }
        }
      }
      await Promise.all([voteData.save(), user.save()]);
      res.send({ message: "success" });
    } catch (error) {
      if (error) return res.status(400).send({ error: error.message });
      res.status(404).send({ error: "Something went wrong" });
    }
  }
);

module.exports = router;
