import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../features/cart/cartSlice";
import Message from "../components/layout/Message";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    console.log("Cart Items:", cartItems);
  }, [cartItems]);

  // Safely calculate items count
  const itemsCount = cartItems.reduce((acc, item) => {
    return acc + (item?.qty || 0);
  }, 0);

  // Safely calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item?.qty || 0) * (item?.price || 0);
  }, 0);

  const tax = subtotal * 0.15; // 15% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  const updateCartHandler = (id, qty) => {
    dispatch(addToCart({ id, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    if (userInfo) {
      navigate("/shipping");
    } else {
      navigate("/login?redirect=shipping");
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <Message>
          Your cart is empty.{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Go Back
          </Link>
        </Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {cartItems.map((item) => {
                // Ensure item has required properties
                if (!item || !item.product || !item.name || !item.price) {
                  console.warn("Invalid cart item:", item);
                  return null;
                }

                return (
                  <div
                    key={item.product}
                    className="p-4 border-b flex flex-col sm:flex-row items-center"
                  >
                    <div className="w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                      <img
                        src={item.image || "/placeholder-image.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 px-4">
                      <Link
                        to={`/product/${item.product}`}
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-gray-600">
                        ${(item.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center mt-4 sm:mt-0">
                      <select
                        value={item.qty || 1}
                        onChange={(e) =>
                          updateCartHandler(
                            item.product,
                            Number(e.target.value)
                          )
                        }
                        className="border rounded p-2 mr-4 w-16"
                      >
                        {[
                          ...Array(
                            Math.max(item.countInStock || 1, item.qty || 1)
                          ).keys(),
                        ].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => removeFromCartHandler(item.product)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Items ({itemsCount}):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (15%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
