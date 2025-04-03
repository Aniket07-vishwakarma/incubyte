const express = require("express");
const { createUser, getUserById, getUsers } = require("./controllers/user");
const router = express.Router();
const multer = require("multer");
const { compareFile } = require("./services/compareFile");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/user", (req, res) => createUser(req, res));
router.get("/userById", (req, res) => getUserById(req, res));
router.get("/users", (req, res) => getUsers(req, res));

router.post(
  "/compare-file",
  upload.fields([{ name: "fileA" }, { name: "fileB" }]),
  (req, res) => compareFile(req, res)
);

module.exports = router;
