require("dotenv").config();
const path = require("path");
const express = require("express");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const app = express();
const cookieParser = require('cookie-parser');
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
const renderRoute = require("./routes/render.route")
const userRoute = require("./routes/user.route");
const tokenRoute = require("./routes/token.route");
const voteRoute = require("./routes/vote.route");

app.use("/api/vndb", vndbRoute);
app.use("/api/patch", patchRoute);
app.use("/api/user", userRoute);
app.use("/api/vote",voteRoute)
app.use("/api", tokenRoute);
app.use("/", renderRoute);

app.listen(port, console.log(`Server running on port ${port}`));
