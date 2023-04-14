const express = require("express");
const morgan = require("morgan");

const dev = require("./config");

const app = express();

const PORT = dev.app.serverPort;

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
