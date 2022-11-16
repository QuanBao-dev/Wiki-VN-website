const { compare } = require("bcryptjs");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const {
  loginValidation,
  registerValidation,
  changeInfoAccountValidation,
} = require("../validation/user.validation");
const nodemailer = require("nodemailer");
const tokenModel = require("../models/token.model");
const { verifyRole } = require("../middlewares/verifyRole");
const cloudinary = require("cloudinary");
const loginTokenModel = require("../models/loginToken.model");
const validEmailSuffixes = ["@gmail.com", "@yahoo.com", "@hotmail.com"];
router.post("/login", async (req, res) => {
  const result = loginValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const { email, password } = req.body;
  try {
    if (!isEmailValid(email)) {
      return res.status(400).send({
        error:
          "Email is invalid, only accepted the email containing these prefixes @gmail.com, @yahoo.com, @hotmail.com",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "Email or Password is wrong" });
    }
    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).send({ error: "Email or Password is wrong" });
    }
    if (!user.isVerified) {
      await verifyEmailUser(user);
      return res.status(401).send({
        error: "Unverified email, Please check your email to verify your email",
      });
    }
    const token = jwt.sign(
      {
        userId: user.userId,
        createdAt: Date.now(),
        isVerified: user.isVerified,
        role: user.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 1,
      }
    );
    await addNewAccessToken(user, token);
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 86400000),
      sameSite: "strict",
      path: "/",
      secure: true,
      signed: true,
    });
    res.send({ message: token });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  const result = registerValidation(req.body);

  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const { username, email, password, confirmedPassword } = req.body;
  if (!isEmailValid(email)) {
    return res.status(400).send({
      error:
        "Email is invalid, only accepted the email containing these prefixes @gmail.com, @yahoo.com, @hotmail.com",
    });
  }
  try {
    if (password !== confirmedPassword) {
      return res.status(400).send({ error: "Wrong confirmed password" });
    }
    const [emailExist, usernameExist] = await Promise.all([
      userModel.findOne({ email }),
      userModel.findOne({ username }),
    ]);
    if (emailExist) {
      return res.status(400).send({ error: "Email already existed" });
    }
    if (usernameExist) {
      return res.status(400).send({ error: "Username already existed" });
    }
    const newUser = new userModel({ username, email });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await verifyEmailUser(newUser);
    await newUser.save();
    return res.send({
      message: "Checking your email account, Please verify your email address",
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:vnId/vote", verifyRole("Admin"), async (req, res) => {
  try {
    const { vnId } = req.params;
    const users = await userModel.aggregate([
      { $match: { votedVnIdList: parseInt(vnId) } },
      { $project: { _id: 0, avatarImage: 1, username: 1, email: 1 } },
    ]);
    res.send({ message: users });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete("/logout", verifyRole("Admin", "User"), async (req, res) => {
  const { userId } = req.user;
  console.log(userId);
  try {
    await loginTokenModel.findOneAndDelete({ userId }).lean();
    res.clearCookie("token", { path: "/" });
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/edit", verifyRole("Admin", "User"), async (req, res) => {
  const { username, email, password, avatarImage } = req.body;
  const result = changeInfoAccountValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const { userId, newToken } = req.user;
  try {
    const user = await userModel.findOne({ userId });
    if (!user) return res.status(400).send({ error: "User doesn't exist" });

    if (username) {
      const isExactPassword = await compare(password, user.password);
      if (!isExactPassword)
        return res.status(400).send({ error: "Wrong Password" });
      const isUsernameExisted = await userModel.findOne({ username });
      if (isUsernameExisted)
        return res.status(400).send({ error: "Username existed" });
      user.username = username;
      await user.save();
      return res.send({
        message: { newToken },
      });
    }

    if (email) {
      const isExactPassword = await compare(password, user.password);
      if (!isExactPassword)
        return res.status(400).send({ error: "Wrong Password" });
      const isEmailExisted = await userModel.findOne({ email });
      if (isEmailExisted) {
        return res
          .status(400)
          .send({ error: "Email is already used by other accounts" });
      }
      user.email = email;
      user.isVerified = false;
      await verifyEmailUser(user);
      return res.status(401).send({
        error: "Checking your email account, Please verify your new email",
      });
    }

    if (avatarImage) {
      const result = await cloudinary.v2.uploader.upload(avatarImage, {
        width: 500,
        height: 500,
        overwrite: true,
        folder: "sugoi-visual-novel/avatar-user",
        public_id: user.userId,
        invalidate: true,
      });
      user.avatarImage = result.secure_url;
      user.avatarImage = user.avatarImage.replace(
        "upload/",
        "upload/f_auto,q_auto/"
      );
      await user.save();
      res.send({
        message: { newToken },
      });
    }
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

async function addNewAccessToken(user, token) {
  let loginToken = await loginTokenModel.findOne({
    userId: user.userId,
  });
  if (!loginToken) {
    loginToken = new loginTokenModel({
      userId: user.userId,
    });
  }
  loginToken.accessTokenList[0] = token;
  await loginToken.save();
}

function sendEmail(to, subject, message) {
  return new Promise((res, rej) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_EMAIL,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        rej(error);
      } else {
        res("Email sent:" + info.response);
        console.log("Email sent:" + info.response);
      }
    });
  });
}

function isEmailValid(email) {
  let check = false;
  validEmailSuffixes.forEach((suffix) => {
    if (email.includes(suffix)) {
      check = true;
    }
  });
  return check;
}

async function verifyEmailUser(user) {
  let token = await tokenModel.findOne({ userId: user.userId });
  if (!token) {
    token = new tokenModel({
      userId: user.userId,
    });
    await token.save();
  }
  const tokenString = jwt.sign(
    {
      userId: token.userId,
      email: user.email,
      createdAt: token.createdAt,
    },
    process.env.JWT_KEY,
    {
      expiresIn: 60,
    }
  );
  await sendEmail(
    user.email,
    "Verify your email address",
    `
      - This link will be expired in 1 minute
      - Please click this link to verify your email address: ${process.env.HOST_EMAIL}/verify/${tokenString}
      `
  );
}

module.exports = router;
