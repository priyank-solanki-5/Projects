import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddCombo from "./AddCombo";
import { CartContext } from "../store/cartContextValue";
import { useNavigate } from "react-router-dom";

const Combos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://bookstore-c1tt.onrender.com/api/combos`
      );
      setCombos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const { addToCart } = useContext(CartContext) || {};
  const navigate = useNavigate();

  const handleEditCombo = (combo) => {
    setEditingCombo(combo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCombo(null);
  };

  const filteredCombos = combos.filter((combo) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (combo.name || "").toLowerCase().includes(q) ||
      // Support both populated book objects and raw ids/strings
      (combo.books || [])
        .map((b) =>
          typeof b === "object" ? b.title || b.name || "" : String(b)
        )
        .join(" ")
        .toLowerCase()
        .includes(q) ||
      String(combo._id || combo.id || "").includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-bold">🎁 Combos</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          ➕ Add Combo
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by Combo Name, Books, or ID..."
          className="w-full p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Combos Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Combo Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Books Included
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredCombos.length > 0 ? (
                filteredCombos.map((combo) => (
                  <tr key={combo._id || combo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <img
                        src={
                          combo.imageUrl ||
                          combo.image ||
                          "https://picsum.photos/100/100"
                        }
                        alt={combo.name}
                        className="w-12 h-12 object-cover mx-auto rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {combo._id || combo.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {combo.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {(combo.books || [])
                        .map((b) =>
                          typeof b === "object"
                            ? b.title || b.name || b._id
                            : String(b)
                        )
                        .join(", ")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof combo.price === "number"
                        ? `₹${combo.price}`
                        : combo.price}
                    </td>
                    <td
                      className={`px-4 py-4 whitespace-nowrap text-sm ${
                        combo.stock <= 0
                          ? "text-red-500 font-semibold"
                          : "text-gray-900"
                      }`}
                    >
                      {combo.stock <= 0 ? "❌ Out of Stock" : combo.stock}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditCombo(combo)}
                            className="btn-secondary"
                          >
                            Edit
                          </button>
                          <button className="btn-danger">Delete</button>
                        </div>
                        <button
                          onClick={() => {
                            if (combo.stock <= 0) {
                              alert("Book not available - Stock is 0");
                              return;
                            }
                            if (addToCart) {
                              try {
                                addToCart({
                                  ...combo,
                                  merge: false,
                                  isCombo: true,
                                });
                              } catch {
                                console.error("addToCart failed");
                              }
                            }
                            // stay on the current page after adding to cart
                          }}
                          className={`btn-warning ${
                            combo.stock <= 0
                              ? "!bg-gray-400 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={combo.stock <= 0}
                        >
                          {combo.stock <= 0
                            ? "❌ Out of Stock"
                            : "🛒 Add to Cart"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    ❌ No combos found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Combo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] flex flex-col">
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800 text-xl"
              >
                ✖
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AddCombo
                comboToEdit={editingCombo}
                onSaved={() => {
                  handleCloseModal();
                  fetchCombos();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combos;
