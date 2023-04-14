const mongoose = require("mongoose");
const dev = require(".");
const connectDB = async () => {
  try {
    await mongoose.connect(dev.db.url);
    console.log("DB is connected");
  } catch (error) {
    console.log("Database is broket");
    console.log(error);
  }
};
module.exports = connectDB;
