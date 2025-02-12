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
  beforeAll(AwaitDependencies);

  it("POST /user ---> Create User", async () => {
    const response = await request(app)
      .post("/user")
      .send(createUserMockData)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("password");
  });

  it("POST /user --> should return 401 if name is duplicate", async () => {
    const response = await request(app)
      .post("/user")
      .send(createDupUserMockData)
      .expect("Content-Type", /json/)
      .expect(401);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("duplicate key error collection");
  });

  it("GET /userById --> should return a user when a valid ID is provided", async () => {
    // const mockUser = {
    //   _id: "123",
    //   name: "John Doe",
    //   email: "john@example.com",
    // };
    // User.findById.mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/userById")
      .query({ _id: "67acc6e8b931f82da988bbbe" })
      .expect("Content-Type", /json/)
      .expect(201);

    // expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("password");
  });

  it("should return a 401 error when an invalid ID is provided", async () => {
    const errorMessage = "User not found";
    User.findById.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .get("/user")
      .query({ id: "invalid-id" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", errorMessage);
  });
});
