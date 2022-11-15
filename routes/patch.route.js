const route = require("express").Router();
const { verifyRole } = require("../middlewares/verifyRole");
const Patch = require("../models/patch.model");
const ouo = require("ouo.io")(process.env.OUO);
const fetch = require("node-fetch");
route.get("/", async (req, res) => {
  const page = parseInt(req.query.page || 0);
  try {
    const patches = (
      await Patch.find({}).select({ _id: 0, createdAt: 1, dataVN: 1 }).lean()
    )
      .sort(
        (a, b) =>
          new Date(new Date(b.createdAt).toUTCString()).getTime() -
          new Date(new Date(a.createdAt).toUTCString()).getTime()
      )
      .slice(page * 10, (page + 1) * 10);
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
route.get("/stats", async (req, res) => {
  try {
    const patches = await Patch.find({}).select({ _id: 0 }).lean();
    res.send({
      message: { vn: patches.length },
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

route.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const patch = await Patch.findOne({ vnId: id })
      .select({
        _id: 0,
        vnId: 1,
        linkDownloads: 1,
        originalLinkDownloads: 1,
        adShrinkLinkDownloads: 1,
      })
      .lean();
    if (!patch) return res.status(400).send({ error: "patch doesn't exist" });
    res.send({
      message: {
        ...patch,
        linkDownloads:
          patch.adShrinkLinkDownloads || patch.originalLinkDownloads,
      },
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

route.post("/", verifyRole("Admin"), async (req, res) => {
  const { vnId, linkDownload, dataVN, isAddingNewPatch } = req.body;
  try {
    let newPatch = await Patch.findOne({ vnId: parseInt(vnId) });
    const ouoLinkDownload = {
      label: linkDownload.label,
      url: await urlShortenerOuo(linkDownload.url),
    };
    const shrinkMeLinkDownload = {
      label: linkDownload.label,
      url: await urlShortenerShrinkme(linkDownload.url),
    };
    const shrinkEarnLinkDownload = {
      label: linkDownload.label,
      url: await urlShortenerShrinkEarn(linkDownload.url),
    };
    const adShrinkLinkDownload = {
      label: linkDownload.label,
      url: await urlShortenerAdShrink(shrinkEarnLinkDownload.url),
    };
    if (!newPatch) {
      newPatch = new Patch({
        vnId,
        linkDownloads: [ouoLinkDownload],
        originalLinkDownloads: [linkDownload],
        shrinkMeLinkDownloads: [shrinkMeLinkDownload],
        shrinkEarnLinkDownloads: [shrinkEarnLinkDownload],
        adShrinkLinkDownloads: [adShrinkLinkDownload],
        dataVN,
      });
    }
    if (newPatch.linkDownloads) {
      if (!isAddingNewPatch) {
        newPatch.linkDownloads = [ouoLinkDownload];
        newPatch.originalLinkDownloads = [linkDownload];
        newPatch.shrinkMeLinkDownloads = [shrinkMeLinkDownload];
        newPatch.shrinkEarnLinkDownloads = [shrinkEarnLinkDownload];
        newPatch.adShrinkLinkDownloads = [adShrinkLinkDownload];
      } else {
        newPatch.linkDownloads.push(ouoLinkDownload);
        newPatch.originalLinkDownloads.push(linkDownload);
        newPatch.shrinkMeLinkDownloads.push(shrinkMeLinkDownload);
        newPatch.shrinkEarnLinkDownloads.push(shrinkEarnLinkDownload);
        newPatch.adShrinkLinkDownloads.push(adShrinkLinkDownload);
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

function urlShortenerOuo(string) {
  return new Promise((res, rej) => {
    ouo.short(string, function (sUrl) {
      res(sUrl);
    });
  });
}

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
async function urlShortenerAdShrink(string) {
  const data = await fetch(
    `https://www.shrink-service.it/v3/public/api/auth/key/${process.env.ADSHRINK}/json/${string}`
  );
  const json = await data.json();
  console.log(json);
  return json.url;
}

module.exports = route;
