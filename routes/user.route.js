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
// const tokenModel = require("../models/token.model");
const { verifyRole } = require("../middlewares/verifyRole");
const cloudinary = require("cloudinary");
const loginTokenModel = require("../models/loginToken.model");
const BMC = require("../utils");
const notificationModel = require("../models/notification.model");
const coffeeModel = require("../models/coffee.model");
const tokenModel = require("../models/token.model");
const coffeeMemberModel = require("../models/coffeeMember.model");
const coffeeSupporterModel = require("../models/coffeeSupporter.model");
const rateLimit = require("express-rate-limit");
const addMonths = require("@jsbits/add-months");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post("/BMC/", async (req, res) => {
  try {
    console.log(req.body);
    await updateAllBMC(true, 1);
    res.send({ message: "Success" });
  } catch (error) {
    if (error) return res.status(400).send({ error });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/kofi/", async (req, res) => {
  let data = JSON.parse(req.body.data);
  console.log(data);
  try {
    if (data.verification_token !== process.env.SUGOIKOFITOKEN) {
      return res.status(401).send({ error: "Access Denied" });
    }
    let coffee = await coffeeModel.findOne({
      email: data.email.toLocaleLowerCase(),
    });
    if (!coffee) {
      coffee = new coffeeModel({
        email: data.email.toLocaleLowerCase(),
        type: data.type,
        fromName: data.from_name,
      });
    }
    coffee.email = data.email.toLocaleLowerCase();
    coffee.type = data.type;
    coffee.fromName = data.from_name;
    coffee.amount = parseFloat(data.amount);
    if (data.type === "Subscription") {
      coffee.becomingMemberAt = data.timestamp;
      coffee.tierName = data.tier_name;
    } else {
      coffee.becomingSupporterAt = data.timestamp;
    }
    coffee.url = data.url;
    await coffee.save();
    await updateAllBMC(true, 1);
    res.send({ message: "Success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/", verifyRole("Admin"), async (req, res) => {
  try {
    const finalResult = await updateAllBMC(true, 1);
    res.send({
      message: finalResult,
    });
  } catch (error) {
    console.log(error.message);
    try {
      const finalResult = await updateAllBMC();
      console.log("temporary");
      res.send({
        message: finalResult,
      });
    } catch (error) {
      if (error) return res.status(400).send({ error: error.message });
      res.status(404).send({ error: "Something went wrong" });
    }
  }
});

async function getAllSupporters(lastPage) {
  const BuyMeCoffee = new BMC(process.env.SUGOICOFFEETOKEN);
  if (!lastPage) lastPage = (await BuyMeCoffee.Supporters()).last_page;
  const data = [];
  for (let i = 1; i <= lastPage; i++) {
    const dataEachPage = await BuyMeCoffee.Supporters(i);
    data.push(...dataEachPage.data);
  }
  return { data };
}
async function getAllSubscriptions(lastPage) {
  const BuyMeCoffee = new BMC(process.env.SUGOICOFFEETOKEN);
  if (!lastPage) lastPage = (await BuyMeCoffee.Subscriptions()).last_page;
  const data = [];
  for (let i = 1; i <= lastPage; i++) {
    const dataEachPage = await BuyMeCoffee.Subscriptions(i);
    data.push(...dataEachPage.data);
  }
  return { data };
}

router.post("/login", apiLimiter, async (req, res) => {
  const result = loginValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  let { email, password } = req.body;
  email = email.toLocaleLowerCase();

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        error:
          "Your account doesn't exist, please register your account before logging in",
      });
    }
    // if (!(await isValidEmail(email))) {
    //   const user = await userModel.findOne({ email });
    //   if (user) await user.delete();
    //   return res.status(400).send({
    //     error: `Fake email is not accepted`,
    //   });
    // }
    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).send({ error: "Email or Password is wrong" });
    }
    if (!user.isNotSpam || !user.isVerified) {
      const allSupporters = (await updateAllBMC(true, 1))
        .filter(({ role }) => ["Member", "Supporter", "Admin"].includes(role))
        .map(({ email }) => email);
      if (!allSupporters.includes(user.email) && user.role !== "Admin") {
        return res.status(401).send({
          error:
            "Require to verify your email address, to do this you have to buy me a coffee using this email address",
        });
      }
      user.isVerified = true;
      user.isNotSpam = true;
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

router.post("/register", apiLimiter, async (req, res) => {
  const result = registerValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  let { username, email, password, confirmedPassword } = req.body;
  email = email.toLocaleLowerCase();
  try {
    if (password !== confirmedPassword) {
      return res.status(400).send({ error: "Wrong confirmed password" });
    }
    const [emailExist, usernameExist] = await Promise.all([
      userModel.findOne({ email }),
      userModel.findOne({ username }),
    ]);
    if (emailExist && emailExist.isNotSpam) {
      return res.status(400).send({
        error:
          "Email already existed, if you are the owner of this email, please login",
      });
    }
    // if (!(await isValidEmail(email))) {
    //   return res.status(400).send({
    //     error: `Fake email is not accepted`,
    //   });
    // }
    if (usernameExist && usernameExist.isNotSpam) {
      return res.status(400).send({ error: "Username already existed" });
    }
    let newUser = emailExist;
    if (!emailExist) {
      newUser = new userModel({ username, email });
    }
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();
    const allSupporters = (await updateAllBMC(true, 1))
      .filter(({ role }) => ["Member", "Supporter", "Admin"].includes(role))
      .map(({ email }) => email);
    if (!allSupporters.includes(newUser.email) && newUser.role !== "Admin") {
      return res.status(401).send({
        error:
          "Require to verify your email address, to do this you have to buy me a coffee using this email address",
      });
    }
    return res.send({
      message:
        "Congrats! Your account has been created successfully! Don't forget to check out my discord too",
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:vnId/vote", async (req, res) => {
  try {
    const { vnId } = req.params;
    const page = req.query.page || 0;
    const [users, [{ length }]] = await Promise.all([
      userModel.aggregate([
        {
          $match: {
            votedVnIdList: parseInt(vnId),
            isVerified: true,
            isNotSpam: true,
          },
        },
        { $sort: { boost: -1, _id: 1 } },
        { $skip: 10 * parseInt(page) },
        { $limit: 10 },
        {
          $project: { _id: 0, avatarImage: 1, username: 1, role: 1, boost: 1 },
        },
      ]),
      userModel.aggregate([
        {
          $match: {
            votedVnIdList: parseInt(vnId),
            isVerified: true,
            isNotSpam: true,
          },
        },
        {
          $group: {
            _id: null,
            length: { $sum: 1 },
          },
        },
        { $project: { _id: 0, length: 1 } },
      ]),
    ]);
    res.send({
      message: {
        data: users.map((user) => {
          if (!user.boost) return { ...user, boost: 1 };
          return user;
        }),
        lastPage: length,
        isNew: parseInt(page) === 0,
      },
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
  const { isFreeAds, isVerified, userId, role, boost, isNotSpam } = req.body;
  try {
    const user = await userModel.findOne({ userId });
    if (user) {
      user.role = role;
      user.isFreeAds = isFreeAds;
      user.isVerified = isVerified;
      user.boost = boost;
      user.isNotSpam = isNotSpam;
    }
    await user.save();
    return res.send({ message: "Success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    return res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/edit/reset/password", async (req, res) => {
  const { password, confirmedPassword } = req.body;
  const authorization = req.headers["authorization"];
  const token = authorization.split(" ")[1];
  if (!token || token === "undefined") {
    return res.status(401).send({ error: "Access Denied" });
  }
  try {
    const { userId } = jwt.verify(token, process.env.JWT_KEY);
    const resetPasswordToken = await tokenModel.findOne({ userId });
    if (!resetPasswordToken)
      return res.status(401).send({ error: "Access Denied" });
    const user = await userModel.findOne({ userId, isNotSpam: true });
    if (!user)
      return res.status(400).send({ error: "Your account doesn't exist" });
    if (password !== confirmedPassword)
      return res.status(400).send({ error: "Invalid confirmed password" });
    const [salt, loginToken] = await Promise.all([
      bcrypt.genSalt(10),
      loginTokenModel.findOne({ userId }),
    ]);
    if (loginToken) await loginToken.delete();
    user.password = await bcrypt.hash(password, salt);
    await Promise.all([user.save(), resetPasswordToken.delete()]);
    res.send({ message: "Success" });
  } catch (error) {
    if (error.message) return res.status(400).send({ error: error.message });
    return res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/reset/password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel
      .findOne({ email, isNotSpam: true, isVerified: true })
      .lean();
    if (!user) return res.status(400).send({ error: "Account doesn't exist" });
    let token = await tokenModel.findOne({ userId: user.userId });
    if (!token) {
      token = new tokenModel({
        userId: user.userId,
      });
    }
    await token.save();
    const jwtToken = jwt.sign(
      {
        userId: token.userId,
        createdAt: token.createdAt,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 15,
      }
    );
    sendEmail(
      email,
      "Reset your password",
      `- This link will be expired after 15 minutes
      - Please click this link ${process.env.HOST_EMAIL}/resetPassword/${jwtToken} to reset your password`
    );
    res.send({ message: "Please check your email to reset your password" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put(
  "/edit",
  verifyRole("Admin", "Supporter", "Member", "User"),
  async (req, res) => {
    const { username, email, password, avatarImage, discordUsername } =
      req.body;
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
      if (discordUsername) {
        const isExactPassword = await compare(password, user.password);
        if (!isExactPassword)
          return res.status(400).send({ error: "Wrong Password" });
        user.discordUsername = discordUsername;
        await user.save();
        return res.send({
          message: { newToken },
        });
      }

      if (email) {
        // if (!(await isValidEmail(email))) {
        //   const user = await userModel.findOne({ email });
        //   if (user) await user.delete();
        //   return res.status(400).send({
        //     error: `Fake email is not accepted`,
        //   });
        // }
        const isExactPassword = await compare(password, user.password);
        if (!isExactPassword)
          return res.status(400).send({ error: "Wrong Password" });
        const isEmailExisted = await userModel.findOne({
          email,
          isNotSpam: true,
        });
        if (isEmailExisted) {
          return res
            .status(400)
            .send({ error: "Email is already used by other accounts" });
        }
        user.email = email;
        user.isVerified = false;
        user.isNotSpam = false;
        await user.save();
        // await verifyEmailUser(user);
        const allSupporters = (await updateAllBMC(true, 1))
          .filter(({ role }) => ["Member", "Supporter", "Admin"].includes(role))
          .map(({ email }) => email);
        if (!allSupporters.includes(user.email) && user.role !== "Admin") {
          return res.status(401).send({
            error:
              "Require to verify your email address, to do this you have to buy me a coffee using this email address",
          });
        }
        res.send({
          message: { newToken },
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
  }
);

async function updateAllBMC(isFetchApiBMC, lastPage) {
  await deleteInactiveAccount();

  let users, supporters, members, peopleFromKofi;
  if (!isFetchApiBMC) {
    [users, supporters, members, peopleFromKofi] = await Promise.all([
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
            isNotSpam: 1,
            discordUsername: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]),
      coffeeSupporterModel.find({}).sort({ support_created_on: -1 }).lean(),
      coffeeMemberModel
        .find({})
        .sort({ subscription_current_period_start: -1 })
        .lean(),
      coffeeModel.find({}).lean(),
    ]);
    supporters = { data: supporters };
    members = { data: members };
  } else {
    [users, supporters, members, peopleFromKofi] = await Promise.all([
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
            isNotSpam: 1,
            discordUsername: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]),
      getAllSupporters(lastPage),
      getAllSubscriptions(lastPage),
      coffeeModel.find({}).lean(),
    ]);
    console.log("ok");
    let coffeeSupporters = await coffeeSupporterModel
      .find({})
      .sort({ support_created_on: -1 });
    for (let i = 0; i < supporters.data.length; i++) {
      const supporter = supporters.data[i];
      let coffeeSupporter = coffeeSupporters.find(
        (v) => v.payer_email === supporter.payer_email
      );
      if (!coffeeSupporter) {
        coffeeSupporter = new coffeeSupporterModel(supporter);
        coffeeSupporters.push(coffeeSupporter);
        await coffeeSupporter.save();
        continue;
      }
      if (
        new Date(coffeeSupporter.support_created_on).getTime() <
        new Date(supporter.support_created_on).getTime()
      ) {
        coffeeSupporter.support_id = supporter.support_id;
        coffeeSupporter.support_note = supporter.support_note;
        coffeeSupporter.support_coffees = supporter.support_coffees;
        coffeeSupporter.transaction_id = supporter.transaction_id;
        coffeeSupporter.support_visibility = supporter.support_visibility;
        coffeeSupporter.support_created_on = supporter.support_created_on;
        coffeeSupporter.support_updated_on = supporter.support_updated_on;
        coffeeSupporter.transfer_id = supporter.transfer_id;
        coffeeSupporter.supporter_name = supporter.supporter_name;
        coffeeSupporter.support_coffee_price = supporter.support_coffee_price;
        coffeeSupporter.support_email = supporter.support_email;
        coffeeSupporter.is_refunded = supporter.is_refunded;
        coffeeSupporter.support_currency = supporter.support_currency;
        coffeeSupporter.referer = supporter.referer;
        coffeeSupporter.country = supporter.country;
        coffeeSupporter.order_payload = supporter.order_payload;
        coffeeSupporter.support_hidden = supporter.support_hidden;
        coffeeSupporter.refunded_at = supporter.refunded_at;
        coffeeSupporter.payer_email = supporter.payer_email;
        coffeeSupporter.payment_platform = supporter.payment_platform;
        coffeeSupporter.payer_name = supporter.payer_name;
        await coffeeSupporter.save();
      }
    }
    let coffeeMembers = await coffeeMemberModel
      .find({})
      .sort({ subscription_current_period_start: -1 });
    for (let j = 0; j < members.data.length; j++) {
      const member = members.data[j];
      let coffeeMember = coffeeMembers.find(
        (v) => v.payer_email === member.payer_email
      );
      if (!coffeeMember) {
        coffeeMember = new coffeeMemberModel(member);
        coffeeMembers.push(coffeeMember);
        await coffeeMember.save();
        continue;
      }
      if (
        new Date(coffeeMember.subscription_current_period_start).getTime() <
        new Date(member.subscription_current_period_start).getTime()
      ) {
        coffeeMember.subscription_id = member.subscription_id;
        coffeeMember.subscription_cancelled_on =
          member.subscription_cancelled_on;
        coffeeMember.subscription_created_on = member.subscription_created_on;
        coffeeMember.subscription_updated_on = member.subscription_updated_on;
        coffeeMember.subscription_current_period_start =
          member.subscription_current_period_start;
        coffeeMember.subscription_current_period_end =
          member.subscription_current_period_end;
        coffeeMember.subscription_coffee_price =
          member.subscription_coffee_price;
        coffeeMember.subscription_coffee_num = member.subscription_coffee_num;
        coffeeMember.subscription_is_cancelled =
          member.subscription_is_cancelled;
        coffeeMember.subscription_is_cancelled_at_period_end =
          member.subscription_is_cancelled_at_period_end;
        coffeeMember.subscription_currency = member.subscription_currency;
        coffeeMember.subscription_message = member.subscription_message;
        coffeeMember.message_visibility = member.message_visibility;
        coffeeMember.subscription_duration_type =
          member.subscription_duration_type;
        coffeeMember.referer = member.referer;
        coffeeMember.country = member.country;
        coffeeMember.is_razorpay = member.is_razorpay;
        coffeeMember.subscription_hidden = member.subscription_hidden;
        coffeeMember.membership_level_id = member.membership_level_id;
        coffeeMember.is_manual_payout = member.is_manual_payout;
        coffeeMember.is_paused = member.is_paused;
        coffeeMember.stripe_status = member.stripe_status;
        coffeeMember.transaction_id = member.transaction_id;
        coffeeMember.payer_email = member.payer_email;
        coffeeMember.payer_name = member.payer_name;
        await coffeeMember.save();
      }
    }
    supporters = {
      data: coffeeSupporters,
    };
    members = {
      data: coffeeMembers,
    };
  }
  let temp = supporters.data.reverse().reduce((ans, v) => {
    ans[v.payer_email] = v;
    return ans;
  }, {});
  peopleFromKofi.forEach((people) => {
    if (people.type === "Donation") {
      if (!temp[people.email]) temp[people.email] = {};
      temp[people.email].payer_email = people.email;
      if (people.becomingSupporterAt) {
        if (!temp[people.email].support_created_on) {
          temp[people.email].support_created_on = people.becomingSupporterAt;
        } else {
          const supportCreatedOn = new Date(
            temp[people.email].support_created_on
          ).getTime();
          const becomingSupporterAt = new Date(
            people.becomingSupporterAt
          ).getTime();
          if (supportCreatedOn < becomingSupporterAt) {
            temp[people.email].support_created_on = people.becomingSupporterAt;
          }
        }
        temp[people.email].support_coffees = parseInt((people.amount || 5) / 5);
        temp[people.email].support_coffee_price = "5.0000";
      }
    }
  });
  supporters.data = Object.values(temp);
  // console.log(supporters.data);
  let finalResult = [];
  if (supporters.data)
    finalResult = await Promise.all(
      users.map(async (user) => {
        for (let i = 0; i < supporters.data.length; i++) {
          const supporter = supporters.data[i];
          if (
            supporter.payer_email === user.email ||
            supporter.payer_email.toLocaleLowerCase() ===
              user.email.toLocaleLowerCase()
          ) {
            const endFreeAdsDate = new Date(
              addMonths(new Date(supporter.support_created_on), 1, true)
            ).getTime();
            if (Date.now() - endFreeAdsDate < 0) {
              const boost =
                parseInt(supporter.support_coffee_price) *
                supporter.support_coffees;
              if (
                user.role !== "Supporter" ||
                user.boost !== boost ||
                !user.isNotSpam
              ) {
                let [userData, notification] = await Promise.all([
                  userModel.findOne({
                    userId: user.userId,
                  }),
                  notificationModel.findOne({
                    userId: user.userId,
                  }),
                ]);
                userData.isFreeAds = true;
                userData.role = "Supporter";
                userData.isNotSpam = true;
                userData.isVerified = true;
                userData.boost = boost;
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
                }! Now your vote is counted as ${boost} votes and you will be able to access to early access patch for 1 month since the last day you supported. This will be end at ${new Date(
                  endFreeAdsDate
                ).toUTCString()}`;
                await Promise.all([userData.save(), notification.save()]);
              }
              return {
                ...user,
                becomingSupporterAt: supporter.support_created_on,
                endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
                isFreeAds: true,
                boost: boost,
                role: "Supporter",
              };
            }
            if (user.isFreeAds !== false || user.boost !== 1) {
              const userData = await userModel.findOne({
                userId: user.userId,
              });
              userData.isFreeAds = false;
              userData.boost = 1;
              userData.role = "User";
              await userData.save();
            }
            return {
              ...user,
              becomingSupporterAt: supporter.support_created_on,
              isFreeAds: false,
              endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
              role: "User",
            };
          }
        }
        return user;
      })
    );
  let temp2 = members.data.reverse().reduce((ans, v) => {
    ans[v.payer_email] = v;
    return ans;
  }, {});
  peopleFromKofi.forEach((people) => {
    if (people.type === "Subscription") {
      if (!temp2[people.email]) temp2[people.email] = {};
      temp2[people.email].payer_email = people.email;
      if (people.becomingMemberAt) {
        if (!temp2[people.email].subscription_current_period_start) {
          temp2[people.email].subscription_current_period_start =
            people.becomingMemberAt;
        } else {
          const subscriptionCurrentPeriodStart = new Date(
            temp2[people.email].subscription_current_period_start
          ).getTime();
          const becomingMemberAt = new Date(people.becomingMemberAt).getTime();
          if (subscriptionCurrentPeriodStart < becomingMemberAt) {
            temp2[people.email].subscription_current_period_start =
              people.becomingMemberAt;
          }
        }
        // const endFreeAdsDate =
        //   new Date(
        //     temp2[people.email].subscription_current_period_start
        //   ).getTime() +
        //   3600 * 1000 * 24 * 31;
        // temp2[people.email].subscription_is_cancelled =
        //   Date.now() - endFreeAdsDate > 0;
      }
      temp2[people.email].subscription_coffee_price = people.amount;
    }
  });
  members.data = Object.values(temp2);
  // console.log(temp2.map((v) => Object.values(v)[0]));
  if (members.data)
    finalResult = await Promise.all(
      finalResult.map(async (user) => {
        for (let i = 0; i < members.data.length; i++) {
          const member = members.data[i];
          if (
            member.payer_email === user.email ||
            member.payer_email.toLocaleLowerCase() ===
              user.email.toLocaleLowerCase()
          ) {
            let ratio = 1;
            let isYearly = false;
            if (member.subscription_duration_type === "year") {
              ratio = 10;
              isYearly = true;
            }
            const endFreeAdsDate = new Date(
              addMonths(
                new Date(member.subscription_current_period_start),
                isYearly ? 12 : 1,
                true
              )
            ).getTime();

            if (Date.now() - endFreeAdsDate < 0) {
              if (
                user.isFreeAds !== true ||
                user.role !== "Member" ||
                user.boost !==
                  parseInt(member.subscription_coffee_price) / ratio ||
                !user.isNotSpam
              ) {
                let [userData, notification] = await Promise.all([
                  userModel.findOne({
                    userId: user.userId,
                  }),
                  notificationModel.findOne({
                    userId: user.userId,
                  }),
                ]);
                userData.isFreeAds = true;
                userData.isNotSpam = true;
                userData.isVerified = true;
                if (!notification) {
                  notification = new notificationModel({
                    userId: user.userId,
                    title: "",
                    message: "",
                  });
                }
                notification.title = "Thank you for your support";
                userData.boost =
                  parseInt(member.subscription_coffee_price) / ratio;
                if (userData.boost === 100) {
                  notification.message = `Hi ${user.username}! Now you are a member with diamond level. Please contact me through discord by direct message on discord. You have the right to request me 2 VNs you want me to translate.`;
                } else if (userData.boost === 200) {
                  notification.message = `Hi ${user.username}! Now you are a member with master level. Please contact me through discord by direct message on discord. You have the right to request me 4 VNs you want me to translate.`;
                } else if (userData.boost === 50) {
                  notification.message = `Hi ${user.username}! Now you are a member with Platinum level. Please contact me through discord by direct message on discord. You have the right to request me 1 VN you want me to translate.`;
                } else {
                  notification.message = `Hi ${
                    user.username
                  }! Now your votes is now boosted by x${parseInt(
                    member.subscription_coffee_price / ratio
                  )}, you can access to the secret room on the top right as well as long as you are still a membership`;
                }
                userData.role = "Member";
                await Promise.all([userData.save(), notification.save()]);
              }
              return {
                ...user,
                becomingMemberAt: member.subscription_current_period_start,
                cancelingMemberAt: new Date(endFreeAdsDate).toUTCString(),
                endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
                isFreeAds: true,
                boost: parseInt(member.subscription_coffee_price) / ratio,
                role: "Member",
              };
            }
            for (let i = 0; i < supporters.data.length; i++) {
              const supporter = supporters.data[i];
              if (
                supporter.payer_email === user.email ||
                supporter.payer_email.toLocaleLowerCase() ===
                  user.email.toLocaleLowerCase()
              ) {
                const endFreeAdsDate = new Date(
                  addMonths(new Date(supporter.support_created_on), 1, true)
                ).getTime();
                if (Date.now() - endFreeAdsDate < 0) {
                  const boost =
                    parseInt(supporter.support_coffee_price) *
                    supporter.support_coffees;
                  if (
                    user.role !== "Supporter" ||
                    user.boost !== boost ||
                    !user.isNotSpam
                  ) {
                    let [userData, notification] = await Promise.all([
                      userModel.findOne({
                        userId: user.userId,
                      }),
                      notificationModel.findOne({
                        userId: user.userId,
                      }),
                    ]);
                    userData.isFreeAds = true;
                    userData.role = "Supporter";
                    userData.isNotSpam = true;
                    userData.isVerified = true;
                    userData.boost = boost;
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
                    }! Now your vote is counted as ${boost} votes and you will be able to access to early access patch for 1 month since the last day you supported. This will be end at ${new Date(
                      endFreeAdsDate
                    ).toUTCString()}`;
                    await Promise.all([userData.save(), notification.save()]);
                  }
                  return {
                    ...user,
                    becomingSupporterAt: supporter.support_created_on,
                    endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
                    isFreeAds: true,
                    boost: boost,
                    role: "Supporter",
                  };
                }
                if (user.isFreeAds !== false || user.boost !== 1) {
                  const userData = await userModel.findOne({
                    userId: user.userId,
                  });
                  userData.isFreeAds = false;
                  userData.boost = 1;
                  userData.role = "User";
                  await userData.save();
                }
                return {
                  ...user,
                  becomingSupporterAt: supporter.support_created_on,
                  isFreeAds: false,
                  endFreeAdsDate: new Date(endFreeAdsDate).toUTCString(),
                  role: "User",
                };
              }
            }
            // if (user.isFreeAds !== false || user.boost !== 1) {
            //   const userData = await userModel.findOne({
            //     userId: user.userId,
            //   });
            //   userData.isFreeAds = false;
            //   userData.boost = 1;
            //   userData.role = "User";
            //   await userData.save();
            // }
            // return {
            //   ...user,
            //   becomingMemberAt: member.subscription_current_period_start,
            //   cancelingMemberAt: member.subscription_current_period_end,
            //   endFreeAdsDate: member.subscription_current_period_end,
            //   isFreeAds: false,
            //   boost: 1,
            //   role: "User",
            // };
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

async function deleteInactiveAccount() {
  const users = await userModel.find({});
  await Promise.all(
    users.map(async ({ userId }) => {
      const user = await userModel.findOne({ userId });
      if (
        Date.now() >=
          new Date(user.createdAt).getTime() + 3600 * 1000 * 1 * 1 &&
        (!user.isVerified || !user.isNotSpam)
      ) {
        await user.delete();
      }
    })
  );
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

module.exports = router;
