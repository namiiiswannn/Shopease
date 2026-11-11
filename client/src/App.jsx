import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setError("");
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Unable to load products. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    api
      .get("/products")
      .then((response) => {
        if (active) {
          setError("");
          setProducts(response.data);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load products:", err);
          setError("Unable to load products. Please check the server.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editingId !== null) {
        await api.put(`/products/${editingId}`, productData);
        setMessage("Product updated successfully.");
      } else {
        await api.post("/products", productData);
        setMessage("Product saved successfully.");
      }

      setEditingId(null);
      setForm({ name: "", description: "", price: "", stock: "" });
      await loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
    });
    setMessage("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", stock: "" });
    setMessage("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setMessage("");
      await api.delete(`/products/${id}`);
      if (editingId === id) {
        handleCancelEdit();
      }
      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete product.");
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <p className="animate-pulse text-sm font-medium text-slate-500">
          Loading your products...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-white px-6 py-5 text-sm font-medium text-red-700 shadow-sm"
        >
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f2f4] px-3 py-6 text-slate-900 sm:px-5">
      <div className="w-full">
        <header className="mb-4">
          <h1 className="text-xl font-bold tracking-tight">
            ShopEasy - Product Management
          </h1>
        </header>

        <form onSubmit={handleSave} className="mb-3 rounded bg-white p-2">
          <h2 className="mb-2 text-sm font-bold">
            {editingId !== null ? "Edit Product" : "Add New Product"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="min-w-0">
              <span className="sr-only">Product name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product name"
                required
                className="w-full rounded-sm border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
            <label className="min-w-0">
              <span className="sr-only">Description</span>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-sm border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
            <label className="min-w-0">
              <span className="sr-only">Price</span>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                required
                className="w-full rounded-sm border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
            <label className="min-w-0">
              <span className="sr-only">Stock quantity</span>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock quantity"
                required
                className="w-full rounded-sm border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Product"
                  : "Save Product"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-sm bg-gray-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              >
                Cancel
              </button>
            )}
          </div>
          {message && (
            <p role="status" className="mt-2 text-xs text-slate-700">
              {message}
            </p>
          )}
        </form>

        <section className="overflow-x-auto rounded bg-white">
          {products.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-600">
              No products found. Add your first product using the form above.
            </div>
          ) : (
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border-b border-gray-400 px-2 py-2 font-bold">
                    ID
                  </th>
                  <th className="border-b border-gray-400 px-2 py-2 font-bold">
                    Product Name
                  </th>
                  <th className="border-b border-gray-400 px-2 py-2 font-bold">
                    Description
                  </th>
                  <th className="border-b border-gray-400 px-2 py-2 font-bold">
                    Price
                  </th>
                  <th className="border-b border-gray-400 px-2 py-2 font-bold">
                    Stock
                  </th>
                  <th className="border-b border-gray-400 px-2 py-2 font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-300 px-2 py-2">
                      {product.id}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-2">
                      {product.name}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-2">
                      {product.description || "-"}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-2">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-2">
                      {product.stock}
                    </td>
                    <td className="border-b border-gray-300 px-2 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-sm bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-sm bg-red-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
