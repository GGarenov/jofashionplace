// tests/cartRoutes.test.js

const request = require("supertest");
const app = require("../server");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const generateToken = require("../utils/generateToken");
const mongoose = require("mongoose");
const shortid = require("shortid");

let userToken;
let user;
let testProduct;
let uniqueId = shortid.generate();

beforeAll(async () => {
  user = await User.create({
    name: `Test User ${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: "password123",
    userName: `testuser${uniqueId}`,
    isAdmin: false,
  });

  userToken = generateToken(user._id);

  testProduct = await Product.create({
    name: "Test Product",
    price: 50,
    image: "https://example.com/image.jpg",
    description: "Test description",
    brand: "Test Brand",
    category: "Test Category",
    countInStock: 10,
    rating: 0,
    numReviews: 0,
    user: user._id,
  });
});

afterAll(async () => {
  await Cart.deleteMany();
  await User.deleteMany();
  await Product.deleteMany();
});

beforeEach(async () => {
  await Cart.deleteMany();
});

describe("Cart Routes", () => {
  it("should add item to cart", async () => {
    const res = await request(app)
      .post(`/api/carts/${user._id}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId: testProduct._id.toString(),
        quantity: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("cartItems");
    expect(res.body.cartItems.length).toBe(1);
    expect(res.body.cartItems[0].product.toString()).toBe(
      testProduct._id.toString()
    );
    expect(res.body.cartItems[0].quantity).toBe(2);
  });

  it("should get the cart for a logged-in user", async () => {
    // Create a cart first to ensure one exists
    await Cart.create({
      user: user._id,
      cartItems: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          image: testProduct.image,
          quantity: 1,
        },
      ],
      shippingAddress: {
        address: "123 Test St",
        city: "Test City",
        postalCode: "12345",
        country: "Test Country",
      },
      totalPrice: 50,
    });

    const res = await request(app)
      .get(`/api/carts/${user._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("cartItems");
  });

  it("should update quantity of an item in the cart", async () => {
    const cart = await Cart.create({
      user: user._id,
      cartItems: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          image: testProduct.image,
          quantity: 2,
        },
      ],
      shippingAddress: {
        address: "123 Test St",
        city: "Test City",
        postalCode: "12345",
        country: "Test Country",
      },
      totalPrice: 100,
    });

    const itemId = cart.cartItems[0]._id;
    console.log("Cart created:", cart);
    console.log("Item ID to update:", itemId);
    console.log("User ID:", user._id);

    const res = await request(app)
      .put(`/api/carts/${user._id}/items/${itemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 });

    console.log("Update response:", res.status, res.body);

    if (res.status === 404) {
      // Let's check if the cart actually exists
      const checkCart = await Cart.findOne({ user: user._id });
      console.log("Cart check after 404:", checkCart);
    }

    expect(res.status).toBe(200);
    expect(res.body.cartItems[0].quantity).toBe(5);
  });

  it("should remove an item from the cart", async () => {
    const cart = await Cart.create({
      user: user._id,
      cartItems: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          image: testProduct.image,
          quantity: 1,
        },
      ],
      shippingAddress: {
        address: "123 Test St",
        city: "Test City",
        postalCode: "12345",
        country: "Test Country",
      },
      totalPrice: 50,
    });

    const itemId = cart.cartItems[0]._id;
    console.log("Cart created:", cart);
    console.log("Item ID to remove:", itemId);
    console.log("User ID:", user._id);

    const res = await request(app)
      .delete(`/api/carts/${user._id}/items/${itemId}`)
      .set("Authorization", `Bearer ${userToken}`);

    console.log("Delete response:", res.status, res.body);

    if (res.body.cartItems && res.body.cartItems.length > 0) {
      console.log("Items still in cart:", res.body.cartItems);
    }

    expect(res.status).toBe(200);
    expect(res.body.cartItems.length).toBe(0);
  });

  it("should clear the entire cart", async () => {
    await Cart.create({
      user: user._id,
      cartItems: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          image: testProduct.image,
          quantity: 1,
        },
      ],
      shippingAddress: {
        address: "123 Test St",
        city: "Test City",
        postalCode: "12345",
        country: "Test Country",
      },
      totalPrice: 50,
    });

    const res = await request(app)
      .delete(`/api/carts/${user._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});
