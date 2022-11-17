const isValidEmail = require("./isValidEmail");

module.exports = async function filterValidUsers(users){
  let validUsers = [];
  for (let i = 0; i < users.length; i++) {
    const { email } = users[i];
    if (await isValidEmail(email)) {
      validUsers.push(users);
    }
  }
}