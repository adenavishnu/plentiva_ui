import React, { useState } from "react";
import { Category } from "@/types";
import { categoryApi, CategoryRequest } from "@/lib/api";
import MediaUploader from "@/components/common/MediaUploader";

interface CategoryFormProps {
    onSuccess?: (category: Category) => void;
    parentCategories?: Category[];
}

const initialState: CategoryRequest = {
    name: "",
    description: "",
    slug: "",
    imageUrl: "",
    isActive: true,
    displayOrder: undefined,
    parentId: undefined,
};

const CategoryForm: React.FC<CategoryFormProps> = ({ onSuccess, parentCategories = [] }) => {
    const [form, setForm] = useState<CategoryRequest>(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setForm((prev: CategoryRequest) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
        } else {
            setForm((prev: CategoryRequest) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleImageUpload = (files: { url?: string }[]) => {
        // Use the first file's url for imageUrl
        const url = files && files.length > 0 ? files[0].url : "";
        setForm((prev: CategoryRequest) => ({ ...prev, imageUrl: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const created = await categoryApi.createCategory(form);
            setForm(initialState);
            if (onSuccess) onSuccess(created);
        } catch (err) {
            const errorMsg = (err as Error)?.message || "Failed to create category";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded shadow">
            <div>
                <label htmlFor="name" className="font-bold flex items-center gap-2">
                    <span className="text-gradient">●</span> Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Category name"
                    className="mt-1 w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
            </div>
            <div>
                <label htmlFor="slug" className="font-bold flex items-center gap-2">
                    <span className="text-gradient">●</span> Slug <span className="text-red-500">*</span>
                    <span
                        className="ml-1 cursor-pointer group relative"
                        tabIndex={0}
                        aria-label="What is a slug?"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                        </svg>

                        <span
                            className="absolute left-1/2 z-10 -translate-x-1/2 mt-2 w-56 rounded bg-gray-900 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none"
                            role="tooltip"
                        >
                            A slug is a URL-friendly identifier, usually lowercase, with words separated by hyphens (e.g. <span className='font-mono'>electronics-accessories</span>). It appears in the page URL.
                        </span>
                    </span>
                </label>
                <input
                    id="slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    placeholder="category-slug"
                    className="mt-1 w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
            </div>
            <div>
                <label htmlFor="description" className="font-bold flex items-center gap-2">
                    <span className="text-gradient">●</span> Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Category description"
                    className="mt-1 w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
            </div>
            <div>
                <label htmlFor="imageUrl" className="font-bold flex items-center gap-2">
                    <span className="text-gradient">●</span> Image
                </label>
                <MediaUploader
                    value={form.imageUrl ? [{ url: form.imageUrl }] : []}
                    onChange={handleImageUpload}
                />
            </div>
            <div>
                <label htmlFor="parentId" className="font-bold flex items-center gap-2">
                    <span className="text-gradient">●</span> Parent Category
                </label>
                <select
                    id="parentId"
                    name="parentId"
                    value={form.parentId || ""}
                    onChange={handleChange}
                    title="Parent Category"
                    className="mt-1 w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                >
                    <option value="">None</option>
                    {parentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="displayOrder" className="font-bold flex items-center gap-2">
                    <span className="text-gradient">●</span> Display Order
                </label>
                <input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    value={form.displayOrder ?? ""}
                    onChange={handleChange}
                    placeholder="Order"
                    className="mt-1 w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive ?? true}
                    onChange={handleChange}
                    className="accent-purple-600"
                />
                <label htmlFor="isActive" className="font-bold">Active</label>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
            >
                {loading ? "Creating..." : "Create Category"}
            </button>
        </form>
    );
};

export default CategoryForm;
