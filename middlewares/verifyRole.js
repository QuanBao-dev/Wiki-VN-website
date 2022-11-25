const jwt = require("jsonwebtoken");
const loginTokenModel = require("../models/loginToken.model");
const userModel = require("../models/user.model");
module.exports.verifyRole = (...roles) => {
  return async (req, res, next) => {
    let token = req.signedCookies.token;
    if (token === "undefined") token = null;
    if (!token) return res.status(401).send({ error: "Access Denied" });
    try {
      const decode = jwt.verify(token, process.env.JWT_KEY);
      req.user = decode;
      if (!roles.includes(req.user.role)) {
        return res.status(401).send({ error: "You don't have permission" });
      }
      return next();
    } catch (error) {
      const decode = jwt.decode(token, { json: true });
      req.user = decode;
      if (!roles.includes(req.user.role)) {
        return res.status(401).send({ error: "You don't have permission" });
      }
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
      if (
        !loginToken ||
        !loginToken.accessTokenList ||
        !loginToken.accessTokenList.includes(token)
      ) {
        return res.status(401).send({ error: "Invalid token" });
      }
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
      try {
        res.cookie("token", newToken, {
          httpOnly: true,
          expires: new Date(Date.now() + 86400000),
          sameSite: "strict",
          path: "/",
          secure: true,
          signed: true,
        });
        await loginToken.save();
      } catch (error) {
        console.log(error);
      }
      return next();
    }
  };
};
