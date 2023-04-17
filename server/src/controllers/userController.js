const jwt = require("jsonwebtoken");
const { securePassword } = require("../helpers/securePassword");
const dev = require("../config");
const User = require("../models/user");
const { sendEmailWithNodeMailer } = require("../helpers/email");

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
    //Synchronous Sign with RSA SHA256
    console.log(email);
    if (userExists) {
      return res.status(400).json({
        message: "This email account is already registered",
      });
    }
    const hashedPassword = await securePassword(password);
    const token = jwt.sign(
      { name, email, phone, hashedPassword, image },
      dev.app.jwtSecretKey,
      { expiresIn: "10m" }
    );

    //prepare the email

    const emailData = {
      email,
      subject: "Account Activation",
      html: `
      <h2> Hello #{name}! </h2>
      <p> Pleaxe click here to <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank"> activate your account </a></p>
      `,
    };
    sendEmailWithNodeMailer(emailData);
    //verification email to the user

    res.status(200).json({
      message: "A verification link has been sent ",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { registerUser };
