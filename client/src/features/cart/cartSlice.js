import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for API calls
const API_URL = "http://localhost:5000";

// Initial state
const initialState = {
  cartItems: [],
  totalPrice: 0,
  loading: false,
  error: null,
};

// Async Thunks for async actions
export const getCart = createAsyncThunk(
  "cart/getCart",
  async (userId, { getState, rejectWithValue }) => {
    const token = getState().auth.token; // Get token from auth state or localStorage
    try {
      const response = await axios.get(`${API_URL}/api/carts/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return data (cart items and total price)
    } catch (error) {
      return rejectWithValue(error.response.data.message); // If error, return the error message
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ id, qty, userId }, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.userInfo?.token;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      `${API_URL}/api/carts/${userId}/items`,
      { productId: id, quantity: qty },
      config
    );
    return response.data;
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async ({ userId, itemId, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/carts/${userId}/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return itemId; // Return itemId for removal
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ userId, itemId, quantity, token }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/carts/${userId}/items/${itemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Return updated cart
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/carts/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return null; // Return null since the cart is cleared
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Create Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        state.totalPrice = action.payload.totalPrice;
        state.error = null;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        state.totalPrice = action.payload.totalPrice;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Item
      .addCase(removeItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(
          (item) => item._id !== action.payload
        );
        state.error = null;
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Item Quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        state.totalPrice = action.payload.totalPrice;
        state.error = null;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
        state.totalPrice = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
