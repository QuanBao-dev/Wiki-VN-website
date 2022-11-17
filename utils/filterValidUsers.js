const isValidEmail = require("./isValidEmail");

module.exports = async function filterValidUsers(users) {
  let validUsers = [];
  const listCheckValidUsers = await Promise.all(
    users.map(async ({ email }) => {
      return await isValidEmail(email);
    })
  );
  for (let i = 0; i < listCheckValidUsers.length; i++) {
    if (listCheckValidUsers[i]) {
      validUsers.push(users[i]);
    }
  }
  return validUsers;
};
