const express = require("express");
const { createUser, getUserById } = require("./controllers/user");
const router = express.Router();

router.post("/user", (req, res) => createUser(req, res));
router.get("/userById", (req, res) => getUserById(req, res));

module.exports = router;
