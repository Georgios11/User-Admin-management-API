const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    minlength: [3, "Name minLength 3 characters "],
    maxlength: [44, "Name maximum length is 44 characters "],
  },
  email: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "user password is required"],
    min: 6,
  },
  phone: {
    type: String,
    required: [true, "user phone number is required"],
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});
