const jwt = require("jsonwebtoken");

module.exports.verifyRole = (...roles) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    let token;
    token = authHeader && authHeader.split(" ")[1];
    if (token === "undefined") token = null;
    if (!token) return res.status(401).send({ error: "Access Denied" });
    try {
      const decode = jwt.verify(token, process.env.JWT_KEY);
      req.user = decode;
      if (!roles.includes(req.user.role)) {
        return res
          .status(401)
          .send({ error: "You don't have permission (role)" });
      }
      return next();
    } catch (error) {
      res.status(400).send({ error: "Invalid token" });
    }
  };
};
