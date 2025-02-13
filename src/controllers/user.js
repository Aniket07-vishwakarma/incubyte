const User = require("../models/User");

module.exports.createUser = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const query = req.query;
    const user = await User.findById(query).lean();

    if (user) {
      res.status(201).json(user);
    } else {
      throw new Error("User not found.");
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.status(201).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
