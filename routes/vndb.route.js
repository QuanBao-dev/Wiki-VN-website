const { default: axios } = require("axios");
const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();
const VNDB = require("vndb-api");
const tags = require("../data/tags.json");
let vndb;
try {
  vndb = new VNDB(nanoid(), {
    acquireTimeout: 10000,
    encoding: "utf-8",
  });
} catch (error) {
  // console.log(error);
}
router.get("/", async (req, res) => {
  let {
    id,
    title,
    isLarger,
    page,
    isCount,
    producers,
    tags,
    isContainLastPage,
  } = req.query;
  isContainLastPage = isContainLastPage === "true";
  let data = {
    filters: [],
    fields:
      "title, description, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims, tags.id, tags.rating, tags.name",
    count: isCount === "true",
  };
  if (page) data.page = page;
  if (id) {
    data.filters = [
      "and",
      ["id", isLarger ? ">=" : "=", "v" + id],
      ["id", "<=", "v" + (parseInt(id) + 10)],
    ];
  }
  if (title) {
    if (data.filters.length > 0) {
      data.filters.push(["search", "=", title]);
    } else {
      data.filters = ["and", ["search", "=", title]];
    }
  }
  if (tags) {
    const list = tags.split(",").map((v) => "g" + v);
    if (data.filters.length > 0) {
      data.filters.push(...list.map((v) => ["tag", "=", v]));
    } else {
      data.filters = ["and", ...list.map((v) => ["tag", "=", v])];
    }
  }
  if (producers) {
    const list = producers.split(",").map((v) => v);
    if (data.filters.length > 0) {
      data.filters.push(...list.map((v) => ["developer", "=", ["id", "=", v]]));
    } else {
      data.filters = [
        "and",
        ...list.map((v) => ["developer", "=", ["id", "=", v]]),
      ];
    }
  }
  try {
    const response = (await axios.post("https://api.vndb.org/kana/vn", data))
      .data;
    // console.log(data);
    if (!isContainLastPage) {
      return res.send({
        message: parseData(response.results),
      });
    }
    res.send({
      message: {
        data: parseData(response.results),
        maxPage: Math.ceil(response.count / 10),
      },
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/tags", (req, res) => {
  const page = req.query.page || 1;
  const q = req.query.q;
  const list = req.query.list;
  const isNormal = req.query.isNormal;
  try {
    if (isNormal === "true") {
      if (!list || list === "undefined") {
        return res.send({
          message: [],
        });
      }
      const tagsData = list
        .split(",")
        .map((v) => {
          const tag = tags.find(({ id }) => id === parseInt(v));
          return {
            id: tag.id,
            name: tag.name,
            cat: tag.cat,
            description: tag.description,
            applicable: tag.applicable,
          };
        })
        .filter((v) => v.applicable === true);
      return res.send({
        message: tagsData,
      });
    }
    const tagsData = tags.map((v) => ({
      name: v.name,
      id: v.id,
      cat: v.cat,
      aliases: v.aliases,
      description: v.description,
      applicable: v.applicable,
    }));
    res.send({
      message: {
        data: tagsData
          .filter(({ name, aliases, applicable }) => {
            for (let i = 0; i < aliases.length; i++) {
              if (aliases[i].match(new RegExp(q, "i"))) return true;
            }
            return !!name.match(new RegExp(q, "i")) && applicable === true;
          })
          .slice((page - 1) * 10, page * 10)
          .map((v) => ({
            name: v.name,
            id: v.id,
            description: v.description,
            cat: v.cat,
          })),
        last_visible_page: Math.ceil(tagsData.length / 10),
      },
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/producers/", async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const q = req.query.q;
  const list = req.query.list;
  const isNormal = req.query.isNormal;
  let producersIdList = [];

  let data = {
    filters: [],
    fields: "id, name, description, aliases, lang, type",
    count: true,
    page,
  };
  if (list && list !== "undefined") {
    producersIdList = list.split(",").map((v) => ["id", "=", v]);
    if (data.filters.length > 0) {
      data.filters.push(...producersIdList);
    } else {
      data.filters = ["or", ...producersIdList];
    }
  }

  if (q && q !== "undefined") {
    if (data.filters.length > 0) {
      data.filters.push(["search", "=", q]);
    } else {
      data.filters = ["and", ["search", "=", q]];
    }
  }
  try {
    const response = (
      await axios.post("https://api.vndb.org/kana/producer", data)
    ).data;
    const producersData = response.results;
    if (isNormal) {
      if (!list || list === "undefined") {
        return res.send({
          message: [],
        });
      }
      return res.send({
        message: producersData,
      });
    }
    res.send({
      message: {
        data: producersData.map((v) => ({
          name: v.name,
          id: v.id,
        })),
        last_visible_page: Math.ceil(response.count / 10),
      },
    });
  } catch (error) {
    res.status(404).send({ error });
  }
});

router.get("/random", async (req, res) => {
  try {
    // const response = await vndb.query(`dbstats`);
    const response = (await axios.get("https://api.vndb.org/kana/stats")).data;
    const { vn } = response;
    const randomNumberList = Array.from(Array(4).keys()).reduce((ans, curr) => {
      let randomNumber = Math.ceil(Math.random() * vn);
      while (ans.includes(randomNumber)) {
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
        "title, description, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims, tags.name, tags.id, tags.rating",
    };
    const randomVNList = (
      await axios.post("https://api.vndb.org/kana/vn", data)
    ).data;
    res.send({
      message: parseData(randomVNList.results),
    });
  } catch (error) {
    // console.log(error);
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

// router.get("/:vnId/tags", async (req, res) => {
//   const vnId = parseInt(req.params.vnId);
//   if (!vndb) return res.status(404).send({ error: "vndb disconnected" });
//   let data = {
//     filters: ["id", "=", "v" + vnId],
//     fields:
//       "tags.id, tags.rating, tags.name"
//   };

//   try {
//     const details = await (
//       await axios.post("https://api.vndb.org/kana/vn", data)
//     ).data;
//     res.send({
//       message: details.results[0].tags,
//     });
//   } catch (error) {
//     console.log({ error });
//     res.status(404).send({ error });
//   }
// });

router.get("/:vnId/relations", async (req, res) => {
  const vnId = parseInt(req.params.vnId);
  if (!vndb) return res.status(404).send({ error: "vndb disconnected" });
  try {
    let items = [];
    items = (await vndb.query(`get vn relations (id = ${vnId})`)).items;
    res.send({
      message: items[0].relations,
    });
  } catch (error) {
    // console.log({ error });
    res.status(404).send({ error });
  }
});
router.get("/:vnId/characters", async (req, res) => {
  const vnId = parseInt(req.params.vnId);
  const page = +req.query.page;
  const data = {
    filters: ["vn", "=", ["id", "=", "v" + vnId]],
    fields:
      "id, name, original, vns.id, vns.spoiler, image.url, image.sexual, sex, vns.role, vns.title, vns.id, description, traits.name, traits.searchable, traits.name",
    count: true,
    page,
  };
  try {
    const response = await axios.post(
      "https://api.vndb.org/kana/character",
      data
    );
    res.send({
      message: {
        data: response.data.results,
        maxPage: Math.ceil(response.data.count / 10),
      },
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
      "title, description, image.sexual, image.url, image.sexual, image.violence, screenshots.thumbnail, screenshots.url, screenshots.sexual, screenshots.violence,rating, length, length_minutes, length_votes, languages, released, aliases, screenshots.dims, tags.name, tags.id, tags.rating, tags.category",
  };
  try {
    const details = await (
      await axios.post("https://api.vndb.org/kana/vn", data)
    ).data;
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
      tags: data.tags
        .sort((a, b) => -a.rating + b.rating)
        .map((tag) => ({ ...tag, rating: parseFloat(tag.rating).toFixed(1) })),
    };
  });
}

module.exports = router;
