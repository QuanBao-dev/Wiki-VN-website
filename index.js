require("dotenv").config();
const path = require("path");
const express = require("express");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

cloudinary.config({
  cloud_name: "storagecloud",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify:false
  },
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("connected to db");
    }
  }
);
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

/////////////////////////////
///////Middleware////
io.use(async (socket, next) => {
  if (!socket.request.headers.cookie) return next(new Error("invalid"));
  const parsedCookies = cookie.parse(socket.request.headers.cookie);
  const token = parsedCookies.token
    .replace("s%3A", "")
    .replace("s:", "")
    .split(".")
    .slice(0, 3)
    .join(".");
  try {
    const decode = jwt.verify(token, process.env.JWT_KEY);
    if (!["Member", "Admin"].includes(decode.role)) {
      return next(new Error("invalid"));
    }
    socket.request.user = decode;
    return next();
  } catch (error) {
    return next(new Error("invalid"));
  }
});

////////Handle chat/////////////
const chatTextModel = require("./models/chatText.model");
io.on("connection", (socket) => {
  // socket.on("user-join", (username) => {
  //   socket.broadcast.emit("new-user-join", `${username} has joined group chat`);
  // });
  // socket.on("user-out", (username) => {
  //   socket.broadcast.emit("new-user-out", `${username} has been left the chat`);
  // });
  socket.on("new-message", async (message, username, role, avatarImage) => {
    const { userId } = socket.request.user;
    if (!userId) {
      console.log("error");
      return;
    }
    const newMessage = new chatTextModel({
      userId,
      text: message,
    });
    await newMessage.save();
    socket.broadcast.emit(
      "send-message-other-users",
      message,
      username,
      role,
      avatarImage
    );
  });
});

////////////////////////////////
app.use(limiter);
app.use(cookieParser(process.env.SECRET_SESSION_COOKIE));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.static(path.join(__dirname, "build")));
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production")
    res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
const vndbRoute = require("./routes/vndb.route");
const patchRoute = require("./routes/patch.route");
const renderRoute = require("./routes/render.route");
const userRoute = require("./routes/user.route");
const tokenRoute = require("./routes/token.route");
const voteRoute = require("./routes/vote.route");
const statsRoute = require("./routes/stat.route");
const notificationRoute = require("./routes/notification.route");
const chatRoute = require("./routes/chat.route");

app.use("/api/vndb", vndbRoute);
app.use("/api/patch", patchRoute);
app.use("/api/user", userRoute);
app.use("/api/vote", voteRoute);
app.use("/api/stats", statsRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/chat", chatRoute);
app.use("/api", tokenRoute);
app.use("/", renderRoute);

server.listen(port, console.log(`Server running on port ${port}`));
