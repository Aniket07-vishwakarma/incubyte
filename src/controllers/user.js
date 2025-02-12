const User = require("../models/User");

module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
};

module.exports.getUserByQueryField = async (req, res) => {
  try {
    const query = req.query;
    const users = await User.findOne(query);
    res.json(users);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
};
