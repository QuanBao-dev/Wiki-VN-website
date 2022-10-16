require("dotenv").config();
const path = require("path");
const express = require("express");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const app = express();
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
  windowMs: 1 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// xnp5KQ12gANk450y
app.use(limiter);
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
// const userRoute = require("./routes/user.route");
// const tokenRoute = require("./routes/token.route");

app.use("/api/vndb", vndbRoute);
app.use("/api/patch", patchRoute);
app.use("/", renderRoute);
// app.use("/api/user", userRoute);
// app.use("/api", tokenRoute);

app.listen(port, console.log(`Server running on port ${port}`));
