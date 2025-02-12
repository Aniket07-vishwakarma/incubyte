const User = require("../models/User");

module.exports.createUser = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const query = req.query;
    const users = await User.findById(query);
    res.status(201).json(users);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
