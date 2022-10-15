const mongoose = require("mongoose");

const patchSchema = mongoose.Schema({
  linkDownloads: {
    type: [{ label: String, url: String }],
    require: true,
  },
  vnId: { type: Number, require: true },
  label: { type: String, require: true },
});

module.exports = mongoose.model("patch", patchSchema);
