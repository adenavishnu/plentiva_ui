"use client";
import React, { useEffect, useState } from "react";
import { categoryApi } from "@/lib/api";
import CategoryForm from "@/components/admin/CategoryForm";
import { Category } from "@/types";
import EditCategoryModal from "@/components/admin/EditCategoryModal";

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (err) {
        const errorMsg = (err as Error)?.message || "Failed to load categories";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSuccess = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleEdit = (cat: Category) => {
    setEditCategory(cat);
    setEditModalOpen(true);
  };

  const handleEditSave = async (updated: Category) => {
    setEditModalOpen(false);
    try {
      const saved = await categoryApi.updateCategory(updated.id!, updated);
      setCategories((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    } catch (err) {
      alert((err as Error)?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setDeleteLoading(id);
    try {
      await categoryApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert((err as Error)?.message || "Failed to delete category");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-gradient">Create Category</h1>
      <CategoryForm onSuccess={handleSuccess} parentCategories={categories} />
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Existing Categories</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="border rounded px-4 py-2 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{cat.name}</span>
                  <span className="text-gray-500 text-sm">({cat.slug})</span>
                  {cat.isActive === false && <span className="ml-2 text-xs text-red-500">Inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
                    onClick={() => handleEdit(cat)}
                  >Edit</button>
                  <button
                    className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => handleDelete(cat.id!)}
                    disabled={deleteLoading === cat.id}
                  >{deleteLoading === cat.id ? "Deleting..." : "Delete"}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <EditCategoryModal
        open={editModalOpen}
        category={editCategory}
        parentCategories={categories}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default AdminCategoriesPage;
