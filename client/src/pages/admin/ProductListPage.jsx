import React, { useEffect } from "react";

const ProductListPage = () => {
  useEffect(() => {
    // Fetch products from backend here
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* map products here */}
          <tr>
            <td className="border p-2">1</td>
            <td className="border p-2">T-Shirt</td>
            <td className="border p-2">$20</td>
            <td className="border p-2">Clothing</td>
            <td className="border p-2">
              <button className="text-blue-600 hover:underline">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductListPage;
