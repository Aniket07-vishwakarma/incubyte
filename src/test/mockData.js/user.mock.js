const date = new Date();

module.exports.createUserMockData = {
  name: "aniket",
  email: `aniket${date.getTime()}@gmail.com`,
  password: "1234test",
};

module.exports.createDupUserMockData = {
  name: "aniket",
  email: "aniket@gmail.com",
  password: "1234test",
};
