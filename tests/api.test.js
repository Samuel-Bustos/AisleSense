const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app.js"); // Import your Express app
const http = require("http"); // Import HTTP to create server

let server;

beforeAll(async () => {
  // Set up database connection before tests
  await mongoose.connect(process.env.TEST_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create an HTTP server and pass the Express app to it
  server = http.createServer(app);
});

afterAll(async () => {
  // Close the server and database connection after tests
  await mongoose.connection.close();
  server.close();
});

// Then use `request(server)` instead of `request(app)`
describe("User Authentication and CRUD API", () => {
  let authToken;
  let itemId;

  it("should register a new user", async () => {
    const res = await request(server).post("/api/users/register").send({
      username: "testuser",
      password: "testpassword",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  // Test login and get JWT token
  it("should login and return a token", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "testuser", password: "testpassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token; // Save token for further tests
  });

  // Test creating an item
  it("should create an item when authenticated", async () => {
    const res = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Test Item", quantity: 10 });

    expect(res.statusCode).toBe(201);
    expect(res.body.item).toBeDefined();
    itemId = res.body.item._id; // Save item ID for further tests
  });

  // Test getting items for a user
  it("should get items for the authenticated user", async () => {
    const res = await request(app)
      .get("/api/items")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  // Test updating an item
  it("should update an item when authenticated", async () => {
    const res = await request(app)
      .put(`/api/items/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ quantity: 20 });

    expect(res.statusCode).toBe(200);
    expect(res.body.item.quantity).toBe(20);
  });

  // Test deleting an item
  it("should delete an item when authenticated", async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
  });
});
