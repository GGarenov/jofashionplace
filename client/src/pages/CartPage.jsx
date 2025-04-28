import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCart,
  removeItem,
  updateItemQuantity,
  clearCart,
} from "../features/cart/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartItems, totalPrice, loading, error } = useSelector(
    (state) => state.cart
  );
  const token = localStorage.getItem("token"); // Assuming you store JWT token in localStorage

  // Fetch cart when component mounts
  useEffect(() => {
    const userId = "USER_ID"; // Replace with actual user ID
    if (token) {
      dispatch(getCart(userId, token));
    }
  }, [dispatch, token]);

  // Handle remove item from cart
  const handleRemoveItem = (itemId) => {
    const userId = "USER_ID"; // Replace with actual user ID
    dispatch(removeItem({ userId, itemId, token }));
  };

  // Handle update item quantity
  const handleUpdateQuantity = (itemId, quantity) => {
    const userId = "USER_ID"; // Replace with actual user ID
    dispatch(updateItemQuantity({ userId, itemId, quantity, token }));
  };

  // Handle clear cart
  const handleClearCart = () => {
    const userId = "USER_ID"; // Replace with actual user ID
    dispatch(clearCart({ userId, token }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl mb-4">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 mr-4"
                />
                <div>
                  <h3 className="text-xl">{item.product.name}</h3>
                  <p>{item.product.description}</p>
                  <p>Price: ${item.product.price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  className="w-16 p-2 border rounded"
                  onChange={(e) =>
                    handleUpdateQuantity(item._id, e.target.value)
                  }
                />
                <button
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={() => handleRemoveItem(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <p className="text-lg">Total Price: ${totalPrice}</p>
            <button
              className="bg-blue-500 text-white p-3 rounded"
              onClick={handleClearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
