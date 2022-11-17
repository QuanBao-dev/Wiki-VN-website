const { verifyRole } = require("../middlewares/verifyRole");
const userModel = require("../models/user.model");
const voteModel = require("../models/vote.model");

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const filterValidUsers = require("../utils/filterValidUsers");

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page || 0);
  try {
    let votes = await voteModel
      .find({ isTranslatable: true })
      .select({
        vnId: 1,
        votes: 1,
        isTranslatable: 1,
        dataVN: 1,
        _id: 0,
      })
      .lean();
    votes = votes
      .sort((a, b) => b.votes - a.votes)
      .slice(page * 10, (page + 1) * 10);

    if (votes.length === 0) {
      return res.status(400).send({ error: "It has reached its last page" });
    }
    res.send({
      message: votes.map((vote) => ({ ...vote.dataVN, votes: vote.votes })),
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:vnId", async (req, res) => {
  const vnId = parseInt(req.params.vnId);
  const decode = jwt.decode(req.signedCookies.token, { json: true });
  try {
    if (!decode) {
      const vote = await voteModel
        .findOne({ vnId })
        .select({ _id: 0, vnId: 1, isTranslatable: 1, dataVN: 1, votes: 1 })
        .lean();
      return res.send({
        message: { ...vote, isIncreased: false },
      });
    }
    const [vote, user, voters] = await Promise.all([
      voteModel
        .findOne({ vnId })
        .select({ _id: 0, vnId: 1, isTranslatable: 1, dataVN: 1, votes: 1 })
        .lean(),
      userModel
        .findOne({ userId: decode.userId })
        .select({ _id: 0, votedVnIdList: 1 })
        .lean(),
      userModel.aggregate([
        { $match: { votedVnIdList: parseInt(vnId) } },
        { $project: { _id: 0, email: 1 } },
      ]),
    ]);
    let validUsers = await filterValidUsers(voters);
    const validUsersLength = validUsers.length;
    // if (validUsersLength === 0) {
    //   const vote = await voteModel.findOne({ vnId });
    //   await vote.delete();
    // }
    // if (validUsersLength !== vote.votes) {
    //   const vote = await voteModel.findOne({ vnId });
    //   vote.votes = validUsersLength;
    //   await vote.save();
    // }
    let isIncreased = false;
    if (user && user.votedVnIdList) {
      if (user.votedVnIdList.includes(vnId)) isIncreased = true;
    }
    res.send({
      message: { ...vote, isIncreased },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/:vnId/translatable", verifyRole("Admin"), async (req, res) => {
  const { isTranslatable, dataVN } = req.body;
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
    await vote.save();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/:vnId", verifyRole("User", "Admin"), async (req, res) => {
  const vnId = +req.params.vnId;
  let { dataVN, isDownVotes } = req.body;
  const { userId } = req.user;
  // isDownVotes = isDownVotes === "true";

  try {
    let [voteData, user] = await Promise.all([
      voteModel.findOne({ vnId }),
      userModel.findOne({ userId }),
    ]);
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
        voteData.votes += 1;
        user.votedVnIdList.push(vnId);
      }
    } else {
      if (isIncreased) {
        if (user.votedVnIdList.includes(vnId)) {
          voteData.votes -= 1;
          user.votedVnIdList = user.votedVnIdList.filter(
            (votes) => votes !== vnId
          );
        }
      }
    }
    if (voteData.votes > 0) {
      await Promise.all([voteData.save(), user.save()]);
    } else {
      await Promise.all([voteData.delete(), user.save()]);
    }

    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
