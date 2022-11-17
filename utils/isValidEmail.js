const fetch = require("node-fetch");
module.exports = async function isValidEmail(email) {
  const data = await fetch("https://www.disify.com/api/email/" + email);
  const json = await data.json();
  // console.log({
  //   email,
  //   url: "https://www.disify.com/api/email/" + email,
  //   check,
  // });
  return !json.disposable;
};
