const express = require("express");
const dev = require("./config");

const app = express();

const PORT = dev.app.serverPort;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
