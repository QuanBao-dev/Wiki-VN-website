const mongoose = require("mongoose");

const patchSchema = mongoose.Schema({
  linkDownloads: {
    type: [{ label: String, url: String }],
    require: true,
  },
  vnId: { type: Number, require: true },
  dataVN: { type: Map, require: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("patch", patchSchema);
