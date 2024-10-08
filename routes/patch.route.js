const route = require("express").Router();
const { verifyRole } = require("../middlewares/verifyRole");
const Patch = require("../models/patch.model");
// const ouo = require("ouo.io")(process.env.OUO);
// const fetch = require("node-fetch");
const { verify } = require("jsonwebtoken");
const userModel = require("../models/user.model");

// route.get("/handle", async (req, res) => {
//   const patches = await Patch.find({});
//   try {
//     await Promise.all(
//       patches.map(async (patch) => {
//         const linkDownloads = [...patch.shrinkEarnLinkDownloads];
//         let temp = [];
//         for (let j = 0; j < linkDownloads.length; j++) {
//           const linkDownload = linkDownloads[j];
//           const shrinkMeLinkDownload = {
//             label: linkDownload.label,
//             url: await urlShortenerShrinkme(linkDownload.url),
//           };
//           temp.push(shrinkMeLinkDownload);
//         }
//         patch.shrinkMeLinkDownloads = temp;
//         await patch.save();
//       })
//     );
//     res.send({ message: "success" });
//   } catch (error) {
//     if (error) return res.status(400).send({ error: error.message });
//     res.status(404).send({ error });
//   }
// });

route.get("/", async (req, res) => {
  const page = parseInt(req.query.page || 0);
  const isMemberOnly = req.query.isMemberOnly === "true";
  const isExclusive = req.query.isExclusive === "true";
  try {
    const patches = await Patch.aggregate(
      [
        {
          $match: !isMemberOnly
            ? {
                $or: isExclusive
                  ? [{ isMemberOnly: true }]
                  : [{ isMemberOnly: false }, { isMemberOnly: undefined }],
              }
            : {},
        },
        {
          $group: {
            _id: { $toDate: "$createdAt" },
            dataVN: { $first: "$dataVN" },
          },
        },
        { $sort: { _id: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
      ],
      {
        allowDiskUse: true,
      }
    );

    res.send({
      message: patches.map((v, key) => {
        v.dataVN.createdAt = v.createdAt;
        return {
          ...v.dataVN,
          sexual: v.dataVN.sexual === undefined ? 0 : v.dataVN.sexual,
          violence: v.dataVN.violence === undefined ? 0 : v.dataVN.violence,
          isPatchContained: true,
          index: page * 10 + key,
          isExclusive,
        };
      }),
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

// async function isUserFreeAds(userId) {
//   const user = await userModel
//     .findOne({ userId })
//     .select({ _id: 0, isFreeAds: 1 })
//     .lean();
//   if (!user) return false;
//   return user.isFreeAds;
// }
async function isMember(userId) {
  const user = await userModel
    .findOne({ userId })
    .select({ _id: 0, role: 1 })
    .lean();
  if (!user) return false;
  return ["Admin", "Member", "Supporter"].includes(user.role);
}

route.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let userId = "";
    try {
      const user = await verify(req.signedCookies.token, process.env.JWT_KEY);
      userId = user.userId;
    } catch (error) {}
    const patch = await Patch.findOne({ vnId: id })
      .select({
        _id: 0,
        vnId: 1,
        linkDownloads: 1,
        originalLinkDownloads: 1,
        affiliateLinks: 1,
        isMemberOnly: 1,
        publishDate: 1,
      })
      .lean();
    if (
      patch.isMemberOnly &&
      patch.publishDate &&
      new Date(patch.publishDate).getTime() < Date.now()
    ) {
      const patchDB = await Patch.findOne({ vnId: id });
      patchDB.isNotifyDiscord = true;
      patchDB.isMemberOnly = false;
      patchDB.channelAnnouncementId = "1063717809114329140";
      await patchDB.save();
      patch.isMemberOnly = patchDB.isMemberOnly;
    }
    if (patch.isMemberOnly && !(await isMember(userId))) {
      return res.status(400).send({
        error: {
          message: "Not a member",
          linkDownloads: patch.originalLinkDownloads.map(({ label }) => ({
            label,
          })),
          affiliateLinks: patch.affiliateLinks,
          isMemberOnly: patch.isMemberOnly,
        },
      });
    }
    if (!patch) return res.status(400).send({ error: "patch doesn't exist" });
    res.send({
      message: {
        vnId: patch.vnId,
        linkDownloads: patch.originalLinkDownloads,
        affiliateLinks: patch.affiliateLinks,
        isMemberOnly: patch.isMemberOnly,
        publishDate: patch.publishDate,
      },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

route.post("/", verifyRole("Admin"), async (req, res) => {
  const {
    vnId,
    type,
    linkDownload,
    dataVN,
    isAddingNewPatch,
    isMemberOnly,
    announcementChannel,
    isNotifyDiscord,
    timeEarlyAccess,
  } = req.body;
  try {
    let newPatch = await Patch.findOne({ vnId: parseInt(vnId) });
    if (linkDownload.label !== "") {
      if (type === "download") {
        // const ouoLinkDownload = {
        //   label: linkDownload.label,
        //   url: await urlShortenerOuo(linkDownload.url),
        // };
        // const shrinkEarnLinkDownload = {
        //   label: linkDownload.label,
        //   url: await urlShortenerShrinkEarn(linkDownload.url),
        // };
        // const shrinkMeLinkDownload = {
        //   label: linkDownload.label,
        //   url: await urlShortenerShrinkme(shrinkEarnLinkDownload.url),
        // };
        if (!newPatch) {
          newPatch = new Patch({
            vnId,
            // linkDownloads: [ouoLinkDownload],
            originalLinkDownloads: [linkDownload],
            dataVN,
          });
          const users = await userModel.find({
            votedVnIdList: parseInt(vnId),
            isVerified: true,
            isNotSpam: true,
          });
          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            user.votedVNsTranslatedAt = new Date(Date.now());
            await user.save();
          }
        }
        if (newPatch.originalLinkDownloads) {
          if (!isAddingNewPatch) {
            // newPatch.linkDownloads = [ouoLinkDownload];
            newPatch.originalLinkDownloads = [linkDownload];
            // newPatch.shrinkMeLinkDownloads = [shrinkMeLinkDownload];
            // newPatch.shrinkEarnLinkDownloads = [shrinkEarnLinkDownload];
          } else {
            // newPatch.linkDownloads.push(ouoLinkDownload);
            newPatch.originalLinkDownloads.push(linkDownload);
            // newPatch.shrinkMeLinkDownloads.push(shrinkMeLinkDownload);
            // newPatch.shrinkEarnLinkDownloads.push(shrinkEarnLinkDownload);
          }
          newPatch.dataVN = dataVN;
        }
      }
      if (type === "affiliate") {
        if (!newPatch) {
          newPatch = new Patch({
            vnId,
            dataVN,
          });
        }
        if (isAddingNewPatch) {
          newPatch.affiliateLinks.push(linkDownload);
        } else {
          newPatch.affiliateLinks = [linkDownload];
        }
        newPatch.dataVN = dataVN;
      }
    }
    newPatch.isMemberOnly = isMemberOnly;
    newPatch.isNotifyDiscord = !!isNotifyDiscord;
    if (isNotifyDiscord) {
      newPatch.channelAnnouncementId = announcementChannel;
    }
    if (newPatch.isMemberOnly) {
      const datePublishTime =
        new Date(newPatch.createdAt).getTime() +
        3600 * 1000 * 24 * parseInt(timeEarlyAccess);
      if (Date.now() < datePublishTime) {
        newPatch.publishDate = new Date(datePublishTime);
      } else {
        newPatch.publishDate = null;
      }
    } else {
      newPatch.publishDate = null;
    }
    newPatch.dataVN = dataVN;
    await newPatch.save();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});
route.delete("/:vnId", verifyRole("Admin"), async (req, res) => {
  const { vnId } = req.params;
  try {
    let newPatch = await Patch.findOne({ vnId: parseInt(vnId) });
    if (!newPatch) {
      return res.status(400).send({ error: "Bad Request" });
    }
    await newPatch.delete();
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

// function urlShortenerOuo(string) {
//   return new Promise((res, rej) => {
//     ouo.short(string, function (sUrl) {
//       res(sUrl);
//     });
//   });
// }

// async function urlShortenerShrinkme(string) {
//   const data = await fetch(
//     `https://shrinkme.io/api?api=${process.env.SHRINKME}&url=${string}`
//   );
//   const json = await data.json();
//   console.log(json);
//   return json.shortenedUrl;
// }

// async function urlShortenerShrinkEarn(string) {
//   const data = await fetch(
//     `https://shrinkearn.com/api?api=${process.env.SHRINKEARN}&url=${string}`
//   );
//   const json = await data.json();
//   console.log(json);
//   return json.shortenedUrl;
// }

module.exports = route;
