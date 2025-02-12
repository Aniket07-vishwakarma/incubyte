const mongoose = require("mongoose");
const { MONGO_DB_INSTANCE } = require("../../environment");
let mongoConnectionHealthy = true;
mongoose.Promise = global.Promise;

module.exports.connectMongoose = async () => {
  await mongoose
    .connect(MONGO_DB_INSTANCE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to the database");
      mongoConnectionHealthy = true;
    })
    .catch((err) => {
      console.log("Could not connect to the database. Exiting now...");
      mongoConnectionHealthy = false;
    });

  mongoose.connection.on("disconnected", (err) => {
    console.log("MongoDB connection disconnected...", err);
    mongoConnectionHealthy = false;
  });

  mongoose.connection.on("reconnected", () => {
    console.log("Successfully reconnected to the database...");
    mongoConnectionHealthy = true;
  });

  mongoose.connection.on("timeout", (err) => {
    console.log("MongoDB connection timeout:", err);
    mongoConnectionHealthy = false;
  });

  mongoose.connection.on("error", (err) => {
    console.log("MongoDB error:", err);
    mongoConnectionHealthy = false;
  });
};
