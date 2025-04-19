import React, { useEffect } from "react";

const OrderListPage = () => {
  useEffect(() => {
    // Fetch orders from backend here
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Orders</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Order ID</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Paid</th>
            <th className="border p-2">Delivered</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* map orders here */}
          <tr>
            <td className="border p-2">#123</td>
            <td className="border p-2">John Doe</td>
            <td className="border p-2">2025-04-18</td>
            <td className="border p-2">$120</td>
            <td className="border p-2">Yes</td>
            <td className="border p-2">No</td>
            <td className="border p-2">
              <button className="text-blue-600 hover:underline">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OrderListPage;
