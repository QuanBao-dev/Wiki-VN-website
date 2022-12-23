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
const isValidEmail = require("../utils/isValidEmail");
const BMC = require("../utils");
const notificationModel = require("../models/notification.model");

router.post("/BMC/", async (req, res) => {
  try {
    await updateAllBMC();
    res.send({ message: "Success" });
  } catch (error) {
    if (error) return res.status(400).send({ error });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/", verifyRole("Admin"), async (req, res) => {
  try {
    const finalResult = await updateAllBMC();
    res.send({
      message: finalResult,
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

async function getAllSupporters() {
  const BuyMeCoffee = new BMC(process.env.SUGOICOFFEETOKEN);
  const { last_page } = await BuyMeCoffee.Supporters();
  const data = [];
  for (let i = 1; i <= last_page; i++) {
    const dataEachPage = await BuyMeCoffee.Supporters(i);
    data.push(...dataEachPage.data);
  }
  return { data };
}
async function getAllSubscriptions() {
  const BuyMeCoffee = new BMC(process.env.SUGOICOFFEETOKEN);
  const { last_page } = await BuyMeCoffee.Subscriptions();
  const data = [];
  for (let i = 1; i <= last_page; i++) {
    const dataEachPage = await BuyMeCoffee.Subscriptions(i);
    data.push(...dataEachPage.data);
  }
  return { data };
}

router.post("/login", async (req, res) => {
  const result = loginValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "Email or Password is wrong" });
    }
    if (!(await isValidEmail(email))) {
      const user = await userModel.findOne({ email });
      if (user) await user.delete();
      return res.status(400).send({
        error: `Fake email is not accepted`,
      });
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
        expiresIn: 60 * 5,
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
    if (!(await isValidEmail(email))) {
      return res.status(400).send({
        error: `Fake email is not accepted`,
      });
    }
    if (usernameExist) {
      return res.status(400).send({ error: "Username already existed" });
    }
    const newUser = new userModel({ username, email });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();
    await Promise.all([verifyEmailUser(newUser), updateAllBMC()]);
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
      { $match: { votedVnIdList: parseInt(vnId), isVerified: true } },
      { $project: { _id: 0, avatarImage: 1, username: 1, email: 1, boost: 1 } },
    ]);
    res.send({
      message: users.map((user) => {
        if (!user.boost) return { ...user, boost: 1 };
        return user;
      }),
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete(
  "/logout",
  verifyRole("Admin", "Supporter", "Member", "User"),
  async (req, res) => {
    const { userId } = req.user;
    try {
      await loginTokenModel.findOneAndDelete({ userId }).lean();
      res.clearCookie("token", { path: "/" });
      res.send({ message: "success" });
    } catch (error) {
      if (error) return res.status(400).send({ error: error.message });
      res.status(404).send({ error: "Something went wrong" });
    }
  }
);

router.delete("/:userId", verifyRole("Admin"), async (req, res) => {
  const userId = req.params.userId;
  try {
    const [user, loginToken] = await Promise.all([
      userModel.findOne({ userId }),
      loginTokenModel.findOne({ userId }),
    ]);
    if (user && loginToken) {
      await Promise.all([user.delete(), loginToken.delete()]);
    } else {
      if (user) await user.delete();
      if (loginToken) await loginToken.delete();
    }
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error });
    return res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/admin/edit", verifyRole("Admin"), async (req, res) => {
  const { isFreeAds, isVerified, userId, role, boost } = req.body;
  try {
    const user = await userModel.findOne({ userId });
    if (user) {
      user.role = role;
      user.isFreeAds = isFreeAds;
      user.isVerified = isVerified;
      user.boost = boost;
    }
    await user.save();
    return res.send({ message: "Success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    return res.status(404).send({ error: "Something went wrong" });
  }
});

router.put(
  "/edit",
  verifyRole("Admin", "Supporter", "Member", "User"),
  async (req, res) => {
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
        if (!(await isValidEmail(email))) {
          const user = await userModel.findOne({ email });
          if (user) await user.delete();
          return res.status(400).send({
            error: `Fake email is not accepted`,
          });
        }
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
      await updateAllBMC();
    } catch (error) {
      if (error) return res.status(400).send({ error: error.message });
      res.status(404).send({ error: "Something went wrong" });
    }
  }
);

async function updateAllBMC() {
  const [users, supporters, members] = await Promise.all([
    userModel.aggregate([
      {
        $project: {
          _id: 0,
          userId: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          isVerified: 1,
          isFreeAds: 1,
          role: 1,
          boost: 1,
          votedVnIdList: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]),
    getAllSupporters(),
    getAllSubscriptions(),
  ]);
  console.log(JSON.stringify(members));

  let finalResult = [];
  if (supporters.data)
    finalResult = await Promise.all(
      users.map(async (user) => {
        for (let i = 0; i < supporters.data.length; i++) {
          const supporter = supporters.data[i];
          if (supporter.payer_email === user.email) {
            const endFreeAdsDate =
              new Date(supporter.support_updated_on).getTime() +
              3600 * 1000 * 24 * 31;
            if ((Date.now() - endFreeAdsDate) / (3600 * 1000 * 24 * 31) <= 1) {
              if (user.isFreeAds !== true) {
                let [userData, notification] = await Promise.all([
                  userModel.findOne({
                    userId: user.userId,
                  }),
                  notificationModel.findOne({
                    userId: user.userId,
                  }),
                ]);
                userData.isFreeAds = true;
                if (!notification) {
                  notification = new notificationModel({
                    userId: user.userId,
                    title: "",
                    message: "",
                  });
                }
                notification.title = "Thank you for your support";
                notification.message = `Hi ${
                  user.username
                }! Now you can freely download the patches on this website without ads for 1 month since the day you supported. This will be end at ${new Date(
                  endFreeAdsDate
                ).toUTCString()}`;
                await Promise.all([userData.save(), notification.save()]);
              }
              return {
                ...user,
                becomingSupporterAt: supporter.support_updated_on,
                endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
                isFreeAds: true,
                role: "Supporter",
              };
            }
            if (user.isFreeAds !== false) {
              const userData = await userModel.findOne({
                userId: user.userId,
              });
              userData.isFreeAds = false;
              await userData.save();
            }
            return {
              ...user,
              becomingSupporterAt: supporter.support_updated_on,
              isFreeAds: false,
              endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
              role: "User",
            };
          }
        }
        return user;
      })
    );
  if (members.data)
    finalResult = await Promise.all(
      finalResult.map(async (user) => {
        for (let i = 0; i < members.data.length; i++) {
          const member = members.data[i];
          if (member.payer_email === user.email) {
            if (!member.subscription_is_cancelled) {
              if (user.isFreeAds !== true || user.role !== "Member") {
                let [userData, notification] = await Promise.all([
                  userModel.findOne({
                    userId: user.userId,
                  }),
                  notificationModel.findOne({
                    userId: user.userId,
                  }),
                ]);
                userData.isFreeAds = true;
                if (!notification) {
                  notification = new notificationModel({
                    userId: user.userId,
                    title: "",
                    message: "",
                  });
                }
                notification.title = "Thank you for your support";
                notification.message = `Hi ${
                  user.username
                }! Now you can freely download the patches on this website without ads as long as you are still a membership and your votes is now boosted by x${parseInt(
                  member.subscription_coffee_price
                )}`;
                userData.boost = parseInt(member.subscription_coffee_price);
                await Promise.all([userData.save(), notification.save()]);
              }
              return {
                ...user,
                becomingMemberAt: member.subscription_current_period_start,
                cancelingMemberAt: member.subscription_current_period_end,
                endFreeAdsDate: member.subscription_current_period_end,
                isFreeAds: true,
                boost: parseInt(member.subscription_coffee_price),
                role: "Member",
              };
            }
            if (
              user.isFreeAds !== false ||
              user.boost !== member.subscription_coffee_price
            ) {
              const userData = await userModel.findOne({
                userId: user.userId,
              });
              userData.isFreeAds = false;
              await userData.save();
            }
            return {
              ...user,
              becomingMemberAt: member.subscription_current_period_start,
              cancelingMemberAt: member.subscription_current_period_end,
              endFreeAdsDate: member.subscription_current_period_end,
              isFreeAds: false,
              boost: 1,
              role: "User",
            };
          }
        }
        return user;
      })
    );
  return finalResult;
}

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
