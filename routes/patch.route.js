const route = require("express").Router();
const { verifyRole } = require("../middlewares/verifyRole");
const Patch = require("../models/patch.model");
// const ouo = require("ouo.io")(process.env.OUO);
const fetch = require("node-fetch");
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
  try {
    const patches = await Patch.aggregate([
      {
        $group: {
          _id: { $toDate: "$createdAt" },
          dataVN: { $first: "$dataVN" },
        },
      },
      { $sort: { _id: -1 } },
      { $skip: 10 * page },
      { $limit: 10 },
    ]);

    res.send({
      message: patches.map((v, key) => {
        v.dataVN.createdAt = v.createdAt;
        return { ...v.dataVN, isPatchContained: true, index: page * 10 + key };
      }),
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

async function isUserFreeAds(userId) {
  const user = await userModel
    .findOne({ userId })
    .select({ _id: 0, isFreeAds: 1 })
    .lean();
  if (!user) return false;
  return user.isFreeAds;
}
route.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let userId = "";
    try {
      const user = await verify(req.signedCookies.token, process.env.JWT_KEY);
      userId = user.userId;
    } catch (error) {}
    const [isFreeAds, patch] = await Promise.all([
      isUserFreeAds(userId),
      Patch.findOne({ vnId: id })
        .select({
          _id: 0,
          vnId: 1,
          linkDownloads: 1,
          originalLinkDownloads: 1,
          shrinkMeLinkDownloads: 1,
          affiliateLinks: 1,
        })
        .lean(),
    ]);
    if (!patch) return res.status(400).send({ error: "patch doesn't exist" });
    res.send({
      message: {
        vnId: patch.vnId,
        linkDownloads: !isFreeAds
          ? patch.originalLinkDownloads
          : patch.originalLinkDownloads,
        affiliateLinks: patch.affiliateLinks,
      },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error });
  }
});

route.post("/", verifyRole("Admin"), async (req, res) => {
  const { vnId, type, linkDownload, dataVN, isAddingNewPatch } = req.body;
  try {
    let newPatch = await Patch.findOne({ vnId: parseInt(vnId) });
    if (type === "download") {
      // const ouoLinkDownload = {
      //   label: linkDownload.label,
      //   url: await urlShortenerOuo(linkDownload.url),
      // };
      const shrinkEarnLinkDownload = {
        label: linkDownload.label,
        url: await urlShortenerShrinkEarn(linkDownload.url),
      };
      const shrinkMeLinkDownload = {
        label: linkDownload.label,
        url: await urlShortenerShrinkme(shrinkEarnLinkDownload.url),
      };
      if (!newPatch) {
        newPatch = new Patch({
          vnId,
          // linkDownloads: [ouoLinkDownload],
          originalLinkDownloads: [linkDownload],
          shrinkMeLinkDownloads: [shrinkMeLinkDownload],
          shrinkEarnLinkDownloads: [shrinkEarnLinkDownload],
          dataVN,
        });
      }
      if (newPatch.shrinkMeLinkDownloads) {
        if (!isAddingNewPatch) {
          // newPatch.linkDownloads = [ouoLinkDownload];
          newPatch.originalLinkDownloads = [linkDownload];
          newPatch.shrinkMeLinkDownloads = [shrinkMeLinkDownload];
          newPatch.shrinkEarnLinkDownloads = [shrinkEarnLinkDownload];
        } else {
          // newPatch.linkDownloads.push(ouoLinkDownload);
          newPatch.originalLinkDownloads.push(linkDownload);
          newPatch.shrinkMeLinkDownloads.push(shrinkMeLinkDownload);
          newPatch.shrinkEarnLinkDownloads.push(shrinkEarnLinkDownload);
        }
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
    }
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

async function urlShortenerShrinkme(string) {
  const data = await fetch(
    `https://shrinkme.io/api?api=${process.env.SHRINKME}&url=${string}`
  );
  const json = await data.json();
  console.log(json);
  return json.shortenedUrl;
}

async function urlShortenerShrinkEarn(string) {
  const data = await fetch(
    `https://shrinkearn.com/api?api=${process.env.SHRINKEARN}&url=${string}`
  );
  const json = await data.json();
  console.log(json);
  return json.shortenedUrl;
}

module.exports = route;
