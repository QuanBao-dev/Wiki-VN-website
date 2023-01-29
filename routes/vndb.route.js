const { default: axios } = require("axios");
const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();
const VNDB = require("vndb-api");
const vndb = new VNDB(nanoid(), {
  acquireTimeout: 10000,
  encoding: "utf-8",
});

router.get("/", async (req, res) => {
  const {
    id,
    title,
    released,
    platforms,
    firstchar,
    languages,
    original,
    orig_lang,
    search,
    tags,
    isLarger,
  } = req.query;
  // let string = "";
  let data = {
    filters: [],
    fields:
      "title, description, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims",
  };
  if (id) {
    data.filters = [
      "and",
      ["id", isLarger ? ">=" : "=", "v" + id],
      ["id", "<=", "v" + (parseInt(id) + 10)],
    ];
    // if (string.length > 0)
    //   string += ` and id ${isLarger ? ">=" : "="} ${id} and id <= ${
    //     parseInt(id) + 10
    //   }`;
    // else
    //   string = `id ${isLarger ? ">=" : "="} ${id} and id <= ${
    //     parseInt(id) + 10
    //   }`;
  }
  // if (released) {
  //   if (string.length > 0) string += " and released >= " + released;
  //   else string = `released >= ${released}`;
  // }
  // if (firstchar) {
  //   if (string.length > 0) string += " and firstchar = " + firstchar;
  //   else string = `firstchar = ${firstchar}`;
  // }
  // if (platforms) {
  //   if (string.length > 0) string += " and platforms = " + platforms;
  //   else string = `platforms = ${platforms}`;
  // }
  // if (title) {
  //   if (string.length > 0) string += ' and title ~ "' + title + '"';
  //   else string = `title ~ "${title}"`;
  // }
  // if (languages) {
  //   if (string.length > 0) string += " and languages = " + languages;
  //   else string = `languages = ${languages}`;
  // }
  // if (original) {
  //   if (string.length > 0) string += " and original = " + original;
  //   else string = `original = ${original}`;
  // }
  // if (orig_lang) {
  //   if (string.length > 0) string += " and orig_lang = " + orig_lang;
  //   else string = `orig_lang = ${orig_lang}`;
  // }
  if (title) {
    if (data.filters.length > 0) {
      data.filters.push(["search", "=", title]);
    } else {
      data.filters = ["search", "=", title];
    }
    // if (string.length > 0) string += " and search = " + search;
    // else string = `search ~ ${search}`;
  }
  // if (tags) {
  //   if (string.length > 0) string += " and tags = " + tags;
  //   else string = `tags = ${tags}`;
  // }
  // console.log(string);
  console.log(data.filters);
  try {
    const response = (await axios.post("https://api.vndb.org/kana/vn", data))
      .data;
    // const response = await vndb.query(
    //   `get vn details,basic,anime,relations,stats,screens,staff,tags (${string})`
    // );
    res.send({
      message: parseData(response.results),
      // .map((data) => {
      //   return { ...data, id: parseInt(data.id) };
      // }),
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/random", async (req, res) => {
  try {
    const response = await vndb.query(`dbstats`);
    const { vn } = response;
    const randomNumberList = Array.from(Array(4).keys()).reduce((ans, curr) => {
      let randomNumber = Math.ceil(Math.random() * vn);
      while (ans[ans.length - 1] === randomNumber) {
        randomNumber = Math.ceil(Math.random() * vn);
      }
      ans.push(randomNumber);
      return ans;
    }, []);
    let data = {
      filters: [
        "or",
        ...randomNumberList
          .map((number) => "v" + number)
          .map((id) => ["id", "=", id]),
      ],
      fields:
        "title, description, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims",
    };
    // console.log(data);
    const randomVNList = await (
      await axios.post("https://api.vndb.org/kana/vn", data)
    ).data;

    // const randomVNList = await vndb.query(
    //   `get vn details,basic,anime,relations,stats,screens,staff,tags (id = ${JSON.stringify(
    //     randomNumberList
    //   )})`
    // );
    res.send({
      message: parseData(randomVNList.results),
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/release", async (req, res) => {
  const {
    id,
    released,
    vn,
    producer,
    title,
    original,
    patch,
    freeware,
    doujin,
    type,
    gtin,
    catalog,
    languages,
    platforms,
  } = req.query;
  let string = "";
  if (id) {
    if (string.length > 0) string += " and id = " + id;
    else string = `id = ${id}`;
  }
  if (released) {
    if (string.length > 0) string += " and released = " + released;
    else string = `released = ${released}`;
  }
  if (vn) {
    if (string.length > 0) string += " and vn = " + vn;
    else string = `vn = ${vn}`;
  }
  if (producer) {
    if (string.length > 0) string += " and producer = " + producer;
    else string = `producer = ${producer}`;
  }
  if (title) {
    if (string.length > 0) string += " and title = " + title;
    else string = `title = ${title}`;
  }
  if (original) {
    if (string.length > 0) string += " and original = " + original;
    else string = `original = ${original}`;
  }
  if (patch) {
    if (string.length > 0) string += " and patch = " + patch;
    else string = `patch = ${patch}`;
  }
  if (freeware) {
    if (string.length > 0) string += " and freeware = " + freeware;
    else string = `freeware = ${freeware}`;
  }
  if (doujin) {
    if (string.length > 0) string += " and doujin = " + doujin;
    else string = `doujin = ${doujin}`;
  }
  if (type) {
    if (string.length > 0) string += " and type = " + type;
    else string = `type = ${type}`;
  }
  if (gtin) {
    if (string.length > 0) string += " and gtin = " + gtin;
    else string = `gtin = ${gtin}`;
  }
  if (catalog) {
    if (string.length > 0) string += " and catalog = " + catalog;
    else string = `catalog = ${catalog}`;
  }
  if (languages) {
    if (string.length > 0) string += " and languages = " + languages;
    else string = `languages = ${languages}`;
  }
  if (platforms) {
    if (string.length > 0) string += " and platforms = " + platforms;
    else string = `platforms = ${platforms}`;
  }
  console.log(string);
  try {
    const vndb = new VNDB(nanoid(), {
      acquireTimeout: 10000,
    });

    const response = await vndb.query(
      `get release basic,details,vn,producers (${string})`
    );
    res.send({
      message: response,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/character", async (req, res) => {
  const { id, name, original, search, vn, traits } = req.query;
  let string = "";
  if (id) {
    if (string.length > 0) string += " and id = " + id;
    else string = `id = ${id}`;
  }
  if (name) {
    if (string.length > 0) string += " and name ~ " + name;
    else string = `name ~ ${name}`;
  }
  if (original) {
    if (string.length > 0) string += " and original ~ " + original;
    else string = `original ~ ${original}`;
  }

  if (search) {
    if (string.length > 0) string += " and search ~ " + search;
    else string = `search ~ ${search}`;
  }

  if (vn) {
    if (string.length > 0) string += " and vn = " + vn;
    else string = `vn = ${vn}`;
  }

  if (traits) {
    if (string.length > 0) string += " and traits = " + traits;
    else string = `traits = ${traits}`;
  }

  try {
    const response = await vndb.query(
      `get character basic,details,traits,meas,vns,voiced,instances (${string})`
    );
    res.send({
      message: response,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/staff", async (req, res) => {
  const { id, aid, search } = req.query;
  let string = "";

  if (search) {
    if (string.length > 0) string += " and search = " + search;
    else string = `search ~ ${search}`;
  }
  if (id) {
    if (string.length > 0) string += " and id = " + id;
    else string = `id = ${id}`;
  }
  if (aid) {
    if (string.length > 0) string += " and aid = " + aid;
    else string = `aid = ${aid}`;
  }

  try {
    const response = await vndb.query(
      `get staff basic,details,aliases,vns,voiced (${string})`
    );
    res.send({
      message: response,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const response = (await axios.get("https://api.vndb.org/kana/stats")).data;
    res.send({
      message: response,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  let data = {
    filters: ["id", "=", "v" + id],
    fields:
      "title, description, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims",
  };
  const details = await (
    await axios.post("https://api.vndb.org/kana/vn", data)
  ).data;
  try {
    res.send({
      message: parseData(details.results)[0],
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

function parseData(data) {
  return data.map((data) => {
    return {
      ...data,
      id: parseInt(data.id.match(/[0-9]+/g)[0]),
      image: data.image.url,
      image_nsfw: data.image.sexual >= 1,
      screens: data.screenshots.map((screenshot) => ({
        ...screenshot,
        nsfw: screenshot.sexual >= 1,
        image: screenshot.url,
        width: screenshot.dims[0],
        height: screenshot.dims[1]
      })),
    };
  });
}

module.exports = router;
