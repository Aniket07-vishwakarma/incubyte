const express = require("express");
const { createUser, getUserById, getUsers } = require("./controllers/user");
const router = express.Router();

router.post("/user", (req, res) => createUser(req, res));
router.get("/userById", (req, res) => getUserById(req, res));
router.get("/users", (req, res) => getUsers(req, res));

module.exports = router;
