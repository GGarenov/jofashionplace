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
    const { data } = await axios.get(`/api/products/${id}`);

    const item = {
      product: data._id,
      name: data.name,
      image: data.image,
      price: data.price,
      countInStock: data.countInStock,
      qty,
    };

    const result = { item, qty };

    // Update localStorage
    const { cart } = getState();
    const updatedCartItems = [...cart.cartItems];

    const existItemIndex = updatedCartItems.findIndex(
      (x) => x.product === item.product
    );

    if (existItemIndex >= 0) {
      updatedCartItems[existItemIndex] = item;
    } else {
      updatedCartItems.push(item);
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

    return result;
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
        state.cartItems[existItemIndex] = item;
      } else {
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
