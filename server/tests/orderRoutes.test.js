const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

jest.setTimeout(15000);

// Helper function to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Add debug function
const logErrorResponse = (res) => {
  if (res.status >= 400) {
    console.log("Error response:", res.status, res.body);
  }
};

// Test users
const testAdmin = {
  name: "Admin User Order",
  email: "admin_order@example.com",
  password: "123456",
  userName: "adminuser_order",
  isAdmin: true,
};

const testUser = {
  name: "Test User Order",
  email: "test_order@example.com",
  password: "123456",
  userName: "testuser_order",
  isAdmin: false,
};

// Test product
const testProduct = {
  name: "Ray-Ban Classic",
  image: "/images/rayban-classic.jpg",
  brand: "Ray-Ban",
  category: "Classic",
  description: "Classic Ray-Ban sunglasses",
  price: 99.99,
  countInStock: 5,
};

// Test order
const testOrder = {
  orderItems: [
    {
      name: "Ray-Ban Classic",
      qty: 2,
      image: "/images/rayban-classic.jpg",
      price: 99.99,
    },
  ],
  shippingAddress: {
    address: "123 Test St",
    city: "Test City",
    postalCode: "12345",
    country: "Test Country",
  },
  paymentMethod: "PayPal",
  taxPrice: 15.99,
  shippingPrice: 10.0,
  totalPrice: 225.97,
};

let adminToken;
let userToken;
let productId;
let orderId;
let adminId;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Clear collections
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Create users with unique usernames
  const createdAdmin = await User.create(testAdmin);
  const createdUser = await User.create(testUser);

  // Store the IDs
  adminId = createdAdmin._id;
  userId = createdUser._id;

  console.log("Created admin:", adminId);
  console.log("Created user:", userId);

  // Generate tokens
  adminToken = generateToken(adminId);
  userToken = generateToken(userId);

  // Create product
  const product = await Product.create({
    ...testProduct,
    user: adminId,
  });
  productId = product._id;

  // Update order items with product ID
  testOrder.orderItems[0].product = productId;
});

afterAll(async () => {
  // Only close the connection, don't delete data
  // This helps when tests are running in parallel
  await mongoose.connection.close();
});

describe("Order Routes", () => {
  it("should create a new order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send(testOrder);

    logErrorResponse(res);
    expect(res.statusCode).toBe(201);
    expect(res.body.orderItems).toHaveLength(1);
    expect(res.body.totalPrice).toBe(testOrder.totalPrice);

    orderId = res.body._id;
    console.log("Created order:", orderId);
  });

  it("should get user's orders", async () => {
    const res = await request(app)
      .get("/api/orders/myorders")
      .set("Authorization", `Bearer ${userToken}`);

    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get order by ID", async () => {
    // Skip this test if orderId wasn't set
    if (!orderId) {
      console.log("Skipping: orderId not set from previous test");
      return;
    }

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`);

    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(orderId);
    expect(res.body.totalPrice).toBe(testOrder.totalPrice);
  });

  it("should update order to paid", async () => {
    // Skip this test if orderId wasn't set
    if (!orderId) {
      console.log("Skipping: orderId not set from previous test");
      return;
    }

    const paymentResult = {
      id: "123456789",
      status: "COMPLETED",
      update_time: new Date().toISOString(),
      email_address: "test@example.com",
    };

    const res = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(paymentResult);

    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.isPaid).toBe(true);
    expect(res.body.paymentResult.id).toBe(paymentResult.id);
  });

  // Testing admin access to orders
  it("should get all orders (admin only)", async () => {
    // Verify admin token and ID
    console.log("Admin ID for all orders:", adminId);
    console.log("Admin token for all orders:", adminToken);

    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`);

    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should update order to delivered (admin only)", async () => {
    // Skip this test if orderId wasn't set
    if (!orderId) {
      console.log("Skipping: orderId not set from previous test");
      return;
    }

    // Create a fresh admin token just for this test
    const adminUser = await User.findById(adminId);
    console.log("Admin user found:", adminUser ? "yes" : "no");
    console.log("Admin user is admin:", adminUser?.isAdmin);

    const freshAdminToken = generateToken(adminId);
    console.log("Fresh admin token:", freshAdminToken);

    const res = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set("Authorization", `Bearer ${freshAdminToken}`)
      .send({});

    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.isDelivered).toBe(true);
    expect(res.body.deliveredAt).toBeTruthy();
  });

  it("should prevent non-admin from getting all orders", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });

  it("should prevent non-admin from marking as delivered", async () => {
    // Skip this test if orderId wasn't set
    if (!orderId) {
      console.log("Skipping: orderId not set from previous test");
      return;
    }

    const res = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });
});
