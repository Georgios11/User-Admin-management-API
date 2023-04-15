const jwt = require("jsonwebtoken");
const { securePassword } = require("../helpers/securePassword");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { image } = req.files;
    if (!name || !email || !phone || !password) {
      return res.status(404).json({
        message: "enter all fields",
      });
    }

    if (password.length < 6) {
      return res.status(404).json({
        message: "Minimum password length is 6 characters",
      });
    }

    if (image && image.size > 1000000) {
      return res.status(404).json({
        message: "Maximum image size is 1MB",
      });
    }
    const userExists = await User.findOne({ email: email });
    //store

    //verification email to the user
    if (userExists) {
      return res.status(400).json({
        message: "This email account is already registered",
      });
    }
    const hashedPassword = await securePassword(password);
    res.status(201).json({
      message: "User is created",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { registerUser };
