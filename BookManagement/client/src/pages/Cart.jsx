import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../store/cartContextValue";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart: cartItems = [],
    updateQuantity,
    removeItem,
  } = useContext(CartContext) || {};

  // Calculate total
  const totalAmount = (cartItems || []).reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  return (
    <div className="p-2 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4">🛒 Cart</h2>

      {cartItems.length > 0 ? (
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium">
                <th className="p-3 border">Item</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Quantity</th>
                <th className="p-3 border">Total</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(cartItems || []).map((item) => {
                // prefer cartItemId when present (unique per cart row)
                const cartRowId =
                  item.cartItemId || item._id || item.id || item.key;
                return (
                  <tr key={String(cartRowId)} className="hover:bg-gray-50">
                    <td className="p-3 border">
                      {item.title || item.name}
                    </td>
                    <td className="p-3 border">
                      {item.type || (item.isCombo ? "Combo" : "Book")}
                    </td>
                    <td className="p-3 border">₹{item.price}</td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        min="1"
                        max={item.stock || 999}
                        value={item.quantity || 1}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value || 1);
                          if (item.stock && newQuantity > item.stock) {
                            alert(`Only ${item.stock} items available in stock`);
                            return;
                          }
                          updateQuantity(cartRowId, newQuantity);
                        }}
                        className="w-16 text-center border rounded"
                      />
                      {item.stock && item.stock < 10 && (
                        <div className="text-xs text-orange-600 mt-1">
                          Only {item.stock} left
                        </div>
                      )}
                    </td>
                    <td className="p-3 border">
                      ₹
                      {(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={() => removeItem(cartRowId)}
                        className="btn-danger text-xs px-3 py-1"
                      >
                        ❌ Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Total and Checkout */}
          <div className="mt-6 flex justify-between items-center">
            <h3 className="text-xl font-bold">Grand Total: ₹{totalAmount}</h3>
            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full"
            >
              ✅ Checkout
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">🛍️ Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
