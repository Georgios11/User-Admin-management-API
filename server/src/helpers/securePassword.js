const bcrypt = require("bcrypt");

const saltRounds = 10;
securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(error);
  }
};
module.exports = { securePassword };
