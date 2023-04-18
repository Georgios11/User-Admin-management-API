const fs = require("fs");
const jwt = require("jsonwebtoken");
const {
  securePassword,
  comparePassword,
} = require("../helpers/securePassword");
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
      <h2> Hello ${name}! </h2>
      <p> Pleasee click here to <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank"> activate your account </a></p>
      `,
    };
    sendEmailWithNodeMailer(emailData);
    //verification email to the user

    res.status(200).json({
      message: "A verification link has been sent to your email ",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(404).json({
        message: "token is missing",
      });
    }
    // verify a token symmetric

    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "token has expired",
        });
      }
      //DECODE THE DATA
      const { name, email, phone, hashedPassword, image } = decoded;
      const userExists = await User.findOne({ email: email });

      if (userExists) {
        return res.status(400).json({
          message: "This email account is already registered",
        });
      }
      //USE THE MODEL TO CREATE THE USER first without image
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        is_verified: 1,
      });
      if (image) {
        newUser.image.data = fs.readFileSync(image.path);
        newUser.image.contentType = image.type;
      }
      const user = await newUser.save();
      if (!user) {
        res.status(400).json({
          message: "user was not created",
        });
      }
      res.status(201).json({
        message: "User was created, ready to sign in",
        user,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        message: "Email or password missing",
      });
    }

    if (password.length < 6) {
      return res.status(404).json({
        message: "Minimum password length is 6 characters",
      });
    }
    const userExists = await User.findOne({ email: email });

    if (!userExists) {
      return res.status(400).json({
        message: "User with this email does not exist",
      });
    }
    const passwordMatch = await comparePassword(password, userExists.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "email or password mismatch",
      });
    }
    res.status(200).json({
      user: {
        name: userExists.name,
        email: userExists.email,
        phone: userExists.phone,
      },
      message: "Login succesful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const logoutUser = (req, res) => {
  try {
    res.status(200).json({
      message: "Logout succesful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { registerUser, verifyEmail, loginUser, logoutUser };
