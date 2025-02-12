require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  MONGO_DB_INSTANCE: process.env.MONGO_DB_INSTANCE,
};
