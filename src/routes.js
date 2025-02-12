const express = require("express");
const { createUser, getUserByQueryField } = require("./controllers/user");
const router = express.Router();

router.post("/user", (req, res) => createUser(req, res));
router.get("/userById", (req, res) => getUserByQueryField(req, res));

module.exports = router;
