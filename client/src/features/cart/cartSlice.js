import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get cart items from localStorage
const cartItems = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems"))
  : [];

const shippingAddress = localStorage.getItem("shippingAddress")
  ? JSON.parse(localStorage.getItem("shippingAddress"))
  : {};

const paymentMethod = localStorage.getItem("paymentMethod")
  ? JSON.parse(localStorage.getItem("paymentMethod"))
  : "";

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ id, qty }, { getState }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);

      // Add comprehensive null checks
      if (!data) {
        throw new Error("No product data received");
      }

      // Ensure image is handled safely
      const imageUrl = data.image
        ? data.image.startsWith("http")
          ? data.image
          : `http://localhost:5000${data.image}`
        : "/placeholder-image.png"; // Fallback image

      const item = {
        product: data._id,
        name: data.name || "Unnamed Product",
        image: imageUrl,
        price: data.price || 0,
        countInStock: data.countInStock || 0,
        qty: Math.min(qty, data.countInStock || 1), // Ensure qty doesn't exceed stock
      };

      const result = { item, qty: item.qty };

      // Update localStorage
      const { cart } = getState();
      const updatedCartItems = [...cart.cartItems];

      const existItemIndex = updatedCartItems.findIndex(
        (x) => x.product === item.product
      );

      if (existItemIndex >= 0) {
        // Update existing item
        updatedCartItems[existItemIndex] = item;
      } else {
        // Add new item
        updatedCartItems.push(item);
      }

      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

      return result;
    } catch (error) {
      console.error("Detailed error adding to cart:", error);

      // Provide more context about the error
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);
      }

      throw error;
    }
  }
);

const initialState = {
  cartItems,
  shippingAddress,
  paymentMethod,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.product !== action.payload
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("shippingAddress", JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("paymentMethod", JSON.stringify(action.payload));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addToCart.fulfilled, (state, action) => {
      const { item, qty } = action.payload;

      const existItemIndex = state.cartItems.findIndex(
        (x) => x.product === item.product
      );

      if (existItemIndex >= 0) {
        // Update existing item
        state.cartItems[existItemIndex] = item;
      } else {
        // Add new item
        state.cartItems.push(item);
      }
    });
  },
});

export const {
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
