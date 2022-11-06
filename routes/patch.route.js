const route = require("express").Router();
const { verifyRole } = require("../middlewares/verifyRole");
const Patch = require("../models/patch.model");

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
        return { ...v.dataVN, isPatchContained: true, index: page*10 + key };
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
      })
      .lean();
    if (!patch) return res.status(400).send({ error: "patch doesn't exist" });
    res.send({
      message: patch,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

route.post("/", verifyRole("Admin"), async (req, res) => {
  const { vnId, linkDownloads, dataVN, isAddingNewPatch } = req.body;
  try {
    let newPatch = await Patch.findOne({ vnId: parseInt(vnId) });
    if (!newPatch) {
      newPatch = new Patch({
        vnId,
        linkDownloads,
        dataVN,
      });
    }
    if (newPatch.linkDownloads) {
      if (!isAddingNewPatch) newPatch.linkDownloads = linkDownloads;
      else newPatch.linkDownloads.push(linkDownloads[0]);
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

module.exports = route;
