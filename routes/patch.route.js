const route = require("express").Router();
// const { verifyRole } = require("../middlewares/verifyRole");
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
      message: patches.map((v) => {
        v.dataVN.createdAt = v.createdAt;
        return { ...v.dataVN, isPatchContained: true };
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
    console.log(patch);
    res.send({
      message: patch,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

// route.post("/", verifyRole("Admin", "User"), async (req, res) => {
//   const { vnId, label, linkDownloads } = req.body;
//   try {
//     const newPatch = await Patch.findOneAndUpdate(
//       { vnId },
//       { label, linkDownloads },
//       { upsert: true, new: true }
//     );
//     res.send({ message: newPatch });
//   } catch (error) {
//     res.status(404).send({ error });
//   }
// });

// route.put("/:id", verifyRole("Admin", "User"), async (req, res) => {
//   const { id } = req.params;
//   const {vnId, label, linkDownloads} = req.body;
//   try {
//     const matchedPatch = await Patch.findOne({ id });
//     if (!matchedPatch)
//       return res.status(400).send({ error: "Patch doesn't exist" });

//   } catch (error) {
//     res.status(404).send({ error });
//   }
// });

module.exports = route;
