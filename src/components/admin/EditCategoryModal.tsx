import React, { useEffect, useState } from "react";
import { Category } from "@/types";

interface EditCategoryModalProps {
  open: boolean;
  category: Category | null;
  parentCategories: Category[];
  onClose: () => void;
  onSave: (updated: Category) => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ open, category, parentCategories, onClose, onSave }) => {
  const [form, setForm] = useState<Category | null>(category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(category);
  }, [category]);

  if (!open || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => prev ? ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }) : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // onSave will call API in parent
      if (form) onSave(form);
    } catch (err) {
      setError((err as Error)?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
        <h2 className="text-xl font-bold mb-4">Edit Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Category name"
              title="Category name"
            />
          </div>
          <div>
            <label className="font-bold">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="category-slug"
              title="Category slug"
            />
          </div>
          <div>
            <label className="font-bold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Category description"
              title="Category description"
            />
          </div>
          <div>
            <label className="font-bold">Parent Category</label>
            <select
              name="parentId"
              value={form.parentId || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              title="Parent Category"
            >
              <option value="">None</option>
              {parentCategories.filter((c) => c.id !== form.id).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold">Display Order</label>
            <input
              name="displayOrder"
              type="number"
              value={form.displayOrder ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Order"
              title="Display order"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={handleChange}
              title="Active"
            />
            <label className="font-bold">Active</label>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 px-4 rounded bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold hover:opacity-90">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
