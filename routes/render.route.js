const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const { default: axios } = require("axios");

router.get("/vns/:vnId", async (req, res) => {
  try {
    const { vnId } = req.params;
    let data = {
      filters: ["id", "=", "v" + vnId],
      fields:
        "title, description, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims",
    };
    let visualNovel = (await axios.post("https://api.vndb.org/kana/vn", data))
      .data;

    if (visualNovel) visualNovel = parseData(visualNovel.results)[0];
    else return res.redirect("/");
    const image = !visualNovel.image_nsfw
      ? visualNovel.image
      : visualNovel.screens &&
        visualNovel.screens.filter(
          ({ nsfw, sexual, violence }) =>
            !nsfw && sexual === 0 && violence === 0
        )[0]
      ? visualNovel.screens
          .filter(
            ({ nsfw, sexual, violence }) =>
              !nsfw && sexual === 0 && violence === 0
          )[0]
          .image.replace(/sf/g, "st")
      : "/background.jpg";
    const { title, description } = visualNovel;
    const filePath = path.join(__dirname, "../build", "index.html");
    const descriptionHTML =
      "A visual novel database where you will get the latest information of all kind of visual novels.";
    const titleHTML = "(Sugoi Visual Novel \\| SVN)";
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
function parseData(data) {
  return data.map((data) => {
    return {
      ...data,
      id: parseInt(data.id.match(/[0-9]+/g)[0]),
      image: data.image ? data.image.url : "/background.jpg",
      sexual: data.image ? data.image.sexual : 0,
      violence: data.image ? data.image.violence : 0,
      image_nsfw: data.image ? data.image.sexual >= 1 : false,
      rating: (data.rating * 0.1).toFixed(2),
      screens: data.screenshots.map((screenshot) => ({
        ...screenshot,
        nsfw: screenshot.sexual >= 1,
        image: screenshot.url,
        width: screenshot.dims[0],
        height: screenshot.dims[1],
      })),
    };
  });
}

module.exports = router;
