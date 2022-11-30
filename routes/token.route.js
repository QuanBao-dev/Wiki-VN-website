const { verifyRole } = require("../middlewares/verifyRole");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const tokenModel = require("../models/token.model");
const loginTokenModel = require("../models/loginToken.model");
router.get("/", verifyRole("Admin","Supporter", "User"), async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await userModel.findOne({ userId }).lean().select({
      _id: 0,
      username: 1,
      avatarImage: 1,
      role: 1,
      createdAt: 1,
      email: 1,
      isFreeAds: 1,
    });
    res.send({
      message: { user: { ...user, exp: req.user.exp, iat: req.user.iat } },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/token/renew", verifyRole("Admin","Supporter", "User"), async (req, res) => {
  const decode = req.user;
  const [loginToken, user] = await Promise.all([
    loginTokenModel.findOne({
      userId: decode.userId,
    }),
    userModel
      .findOne({ userId: decode.userId })
      .select({ _id: false, username: 1 })
      .lean(),
  ]);
  if (!user) {
    if (loginToken) await loginToken.delete();
    return res.status(401).send({ error: "You don't have permission" });
  }
  try {
    const newToken = jwt.sign(
      {
        userId: decode.userId,
        createdAt: Date.now(),
        isVerified: decode.isVerified,
        role: decode.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 5,
      }
    );
    loginToken.accessTokenList[0] = newToken;
    res.cookie("token", newToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 86400000),
      sameSite: "strict",
      path: "/",
      secure: true,
      signed: true,
    });
    await loginToken.save();
    res.send({ message: "Success" });
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
    const users = await userModel.find({});
    await Promise.all(
      users.map(async ({ userId }) => {
        const user = await userModel.findOne({ userId });
        const createdAt = new Date(user.createdAt).getTime();
        if (
          Math.abs(Date.now() - createdAt) / (3600 * 1 * 1000) > 1 &&
          user.isVerified === false
        ) {
          await Promise.all([user.delete(), removeToken(user.userId)]);
        }
      })
    );
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
