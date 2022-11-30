const notificationModel = require("../models/notification.model");
const { verifyRole } = require("../middlewares/verifyRole");
const router = require("express").Router();

router.get("/", verifyRole("User","Supporter", "Admin"), async (req, res) => {
  const { userId } = req.user;
  try {
    const notification = await notificationModel
      .findOne({ userId })
      .select({
        message: 1,
        title: 1,
        _id: 0,
      })
      .lean();
    if (!notification)
      return res.status(400).send({ error: "No notification" });
    res.send({ message: notification });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    return res.status(404).send({ error: "Something went wrong" });
  }
});
router.put("/:userId", verifyRole("User", "Supporter", "Admin"), async (req, res) => {
  const { userId } = req.params;
  const { message, title } = req.body;
  try {
    let notification = await notificationModel.findOne({ userId });
    if (!notification) {
      notification = new notificationModel({
        message,
        title,
        userId,
      });
    }
    notification.title = title;
    notification.message = message;
    await notification.save();
    res.send({ message: "Success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    return res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete("/", verifyRole("Admin","Supporter","User"), async (req, res) => {
  const { userId } = req.user;
  try {
    const notification = await notificationModel.findOne({ userId });
    if (notification) await notification.delete();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    return res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
