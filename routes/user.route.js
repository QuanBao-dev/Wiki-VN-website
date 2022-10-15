const { compare } = require("bcryptjs");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const {
  loginValidation,
  registerValidation,
} = require("../validation/user.validation");
const { verifyRole } = require("../middlewares/verifyRole");

router.post("/login", async (req, res) => {
  const result = loginValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "User doesn't exist" });
    }
    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user.userId, createdAt: Date.now() },
      process.env.JWT_KEY,
      {
        expiresIn: "12h",
      }
    );
    res.send({ message: token });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/register", verifyRole("Admin"), async (req, res) => {
  const result = registerValidation(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const { username, email, password } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (emailExist) {
    return res.status(400).send({ error: "Email already existed" });
  }
  const newUser = new userModel({ username, email });
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);
  try {
    await newUser.save();
    res.send({
      message: "success",
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
