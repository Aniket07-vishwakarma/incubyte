const request = require("supertest");
const app = require("./../../app");
const {
  createUserMockData,
  createDupUserMockData,
} = require("./mockData.js/user.mock");

beforeAll(() => {
  require("../config/mongoose");
});

async function AwaitDependencies() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

describe("users", () => {
  let newCreatedUserId;
  beforeAll(AwaitDependencies);

  it("POST /user ---> Create User", async () => {
    const response = await request(app)
      .post("/user")
      .send(createUserMockData)
      .expect("Content-Type", /json/)
      .expect(201);

    newCreatedUserId = response.body._id;
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("password");
  });

  it("POST /user --> should return 400 if name is duplicate", async () => {
    const response = await request(app)
      .post("/user")
      .send(createDupUserMockData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("duplicate key error collection");
  });

  it("GET /userById --> should return a user when a valid ID is provided", async () => {
    const response = await request(app)
      .get("/userById")
      .query({ _id: newCreatedUserId })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("password");
  });

  it("GET /userById --> should return a 400 error when an invalid ID is provided", async () => {
    const errorMsg = "User not found.";
    const invalidId = "67acd350224a7c935c657b51";
    const response = await request(app)
      .get("/userById")
      .query({ _id: invalidId });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", errorMsg);
  });

  it("GET /users --> should return list of users", async () => {
    const response = await request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          email: expect.any(String),
          password: expect.any(String),
        }),
      ])
    );
  });
});
