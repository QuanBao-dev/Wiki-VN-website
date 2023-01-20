const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();
const VNDB = require("vndb-api");
const vndb = new VNDB(nanoid(), {
  acquireTimeout: 10000,
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
  let string = "";
  if (id) {
    if (string.length > 0)
      string += ` and id ${isLarger ? ">=" : "="} ${id} and id <= ${
        parseInt(id) + 10
      }`;
    else
      string = `id ${isLarger ? ">=" : "="} ${id} and id <= ${
        parseInt(id) + 10
      }`;
  }
  if (released) {
    if (string.length > 0) string += " and released >= " + released;
    else string = `released >= ${released}`;
  }
  if (firstchar) {
    if (string.length > 0) string += " and firstchar = " + firstchar;
    else string = `firstchar = ${firstchar}`;
  }
  if (platforms) {
    if (string.length > 0) string += " and platforms = " + platforms;
    else string = `platforms = ${platforms}`;
  }
  if (title) {
    if (string.length > 0) string += ' and title ~ "' + title + '"';
    else string = `title ~ "${title}"`;
  }
  if (languages) {
    if (string.length > 0) string += " and languages = " + languages;
    else string = `languages = ${languages}`;
  }
  if (original) {
    if (string.length > 0) string += " and original = " + original;
    else string = `original = ${original}`;
  }
  if (orig_lang) {
    if (string.length > 0) string += " and orig_lang = " + orig_lang;
    else string = `orig_lang = ${orig_lang}`;
  }
  if (search) {
    if (string.length > 0) string += " and search = " + search;
    else string = `search ~ ${search}`;
  }
  if (tags) {
    if (string.length > 0) string += " and tags = " + tags;
    else string = `tags = ${tags}`;
  }
  console.log(string);

  try {
    const response = await vndb.query(
      `get vn details,basic,anime,relations,stats,screens,staff,tags (${string})`
    );
    res.send({
      message: response.items,
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
    const randomVNList = await vndb.query(
      `get vn details,basic,anime,relations,stats,screens,staff,tags (id = ${JSON.stringify(
        randomNumberList
      )})`
    );
    res.send({
      message: randomVNList.items,
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
    const response = await vndb.query(`dbstats`);
    res.send({
      message: response,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const visualNovel = await vndb.query(
      `get vn details,basic,anime,relations,stats,screens,staff,tags (id = ${id})`
    );
    res.send({
      message: visualNovel.items[0],
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

module.exports = router;
