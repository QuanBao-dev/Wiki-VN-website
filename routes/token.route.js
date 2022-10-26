const { verifyRole } = require("../middlewares/verifyRole");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const tokenModel = require("../models/token.model");
router.get("/", verifyRole("Admin", "User"), async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await userModel.findOne({ userId }).lean().select({
      _id: 0,
      username: 1,
      avatarImage: 1,
      role: 1,
      createdAt: 1,
      email: 1,
    });
    res.send({ message: { user } });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/verify/:token", async (req, res) => {
  const token = req.params.token;
  try {
    const user = jwt.verify(token, process.env.JWT_KEY);
    const userExisted = await userModel.findOne({ userId: user.userId });
    if (!userExisted) {
      try {
        await removeToken(user.userId);
      } catch (error) {
        return res.status(401).send({ error: "Invalid token" });
      }
      return res.status(401).send({ error: "User doesn't exist" });
    }
    userExisted.isVerified = true;
    userExisted.email = user.email;
    await Promise.all([removeToken(user.userId), userExisted.save()]);
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

async function removeToken(userId) {
  const token = await tokenModel.findOne({ userId });
  if (token) await token.remove();
}

module.exports = router;
