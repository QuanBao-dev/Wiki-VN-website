const mongoose = require("mongoose");

const patchSchema = mongoose.Schema({
  // linkDownloads: {
  //   type: [{ label: String, url: String, _id: false }],
  //   require: true,
  // },
  originalLinkDownloads: {
    type: [{ label: String, url: String, _id: false }],
    require: true,
  },
  // shrinkMeLinkDownloads: {
  //   type: [{ label: String, url: String, _id: false }],
  //   default: [],
  // },
  // shrinkEarnLinkDownloads: {
  //   type: [{ label: String, url: String, _id: false }],
  //   default: [],
  // },
  vnId: { type: Number, require: true },
  dataVN: { type: Map, require: true },
  affiliateLinks: {
    type: [
      {
        label: String,
        url: String,
        _id: false,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isMemberOnly: {
    type: Boolean,
    default: false,
  },
  isNotifyDiscord: {
    type: Boolean,
    default: false,
  },
  channelAnnouncementId: {
    type: String,
  },
  publishDate: {
    type: Date,
  },
});

module.exports = mongoose.model("patch", patchSchema);
