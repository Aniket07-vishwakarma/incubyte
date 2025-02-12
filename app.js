const express = require("express");
const { PORT } = require("./environment");
const { connectMongoose } = require("./src/config/mongoose");
const router = require("./src/routes");

const app = express();
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
  connectMongoose();
});
