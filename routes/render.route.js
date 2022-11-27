const router = require("express").Router();
const path = require("path");
const VNDB = require("vndb-api");
const vndb = new VNDB("vndb2", {
  acquireTimeout: 10000,
});
const fs = require("fs");

router.get("/vns/:vnId", async (req, res) => {
  try {
    const { vnId } = req.params;
    console.log(vnId);
    let visualNovel = await vndb.query(
      `get vn details,basic,anime,relations,stats,screens,staff,tags (id = ${vnId})`
    );
    if (visualNovel) visualNovel = visualNovel.items[0];
    else return res.redirect("/");
    const image = !visualNovel.image_nsfw
      ? visualNovel.image
      : visualNovel.screens &&
        visualNovel.screens.filter(({ nsfw }) => !nsfw)[0]
      ? visualNovel.screens.filter(({ nsfw }) => !nsfw)[0].image
      : "/nsfw-warning.webp";
    const { title, description } = visualNovel;
    const filePath = path.join(__dirname, "../build", "index.html");
    const descriptionHTML =
      "A visual novel database where you will get the latest information of all kind of visual novels.";
    const titleHTML = "Sugoi Visual Novel | SVN";
    const imageHTML = "/background.jpg";
    const titleReg = new RegExp(titleHTML, "g");
    const descriptionReg = new RegExp(descriptionHTML, "g");
    const imageReg = new RegExp(imageHTML, "g");

    let fileContent = await fs.promises.readFile(filePath, {
      encoding: "utf8",
    });
    fileContent = fileContent
      .replace(titleReg, title)
      .replace(
        descriptionReg,
        description ? description.replace(/"/g, "'") : "No description"
      )
      .replace(imageReg, image)
      .replace(/\n/g, "");
    res.send(fileContent);
  } catch (error) {
    console.log(error);
    res.status(404).send("Something went wrong");
  }
});

router.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

module.exports = router;
