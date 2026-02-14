"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Product } from "@/types";
import { getAllProductsFromAPI, deleteProductViaAPI, updateProductViaAPI } from "@/lib/products";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<string>("");

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const allProducts = await getAllProductsFromAPI();
      setProducts(allProducts);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return cats.sort();
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "in-stock") {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (stockFilter === "out-of-stock") {
        filtered = filtered.filter(p => p.stock === 0);
      } else if (stockFilter === "low-stock") {
        filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
      }
    }

    // Sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "stock-asc":
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        filtered.sort((a, b) => b.stock - a.stock);
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setDeletingId(productId);
    const success = await deleteProductViaAPI(productId);
    if (success) {
      setProducts(products.filter((p) => p.id !== productId));
    } else {
      alert("Failed to delete product");
    }
    setDeletingId(null);
  };

  const handleStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setStockValue(product.stock.toString());
  };

  const handleStockSave = async (id: string) => {
    const newStock = parseInt(stockValue);
    if (isNaN(newStock) || newStock < 0) {
      alert("Please enter a valid stock quantity");
      return;
    }

    const success = await updateProductViaAPI(id, { stock: newStock });
    if (success) {
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      setEditingStockId(null);
    } else {
      alert("Failed to update stock");
    }
  };

  const handleStockCancel = () => {
    setEditingStockId(null);
    setStockValue("");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="mt-1 text-gray-600">Create, edit, and manage your product catalogue</p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 font-semibold text-white transition-all hover:shadow-lg"
        >
          <AddIcon fontSize="small" />
          Add Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="filter-category" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FilterListIcon fontSize="small" />
              Category
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="filter-stock" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FilterListIcon fontSize="small" />
              Stock Status
            </label>
            <select
              id="filter-stock"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (&lt; 10)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="sort-by" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <SortIcon fontSize="small" />
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || selectedCategory !== "all" || stockFilter !== "all"
              ? "No products match your filters"
              : "No products found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  return (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {editingStockId === product.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                              title="Stock quantity"
                              autoFocus
                            />
                            <button
                              onClick={() => handleStockSave(product.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Save"
                            >
                              <CheckIcon fontSize="small" />
                            </button>
                            <button
                              onClick={handleStockCancel}
                              className="text-red-600 hover:text-red-700"
                              title="Cancel"
                            >
                              <CloseIcon fontSize="small" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                product.stock > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
                            </span>
                            <button
                              onClick={() => handleStockEdit(product)}
                              className="text-purple-600 hover:text-purple-700"
                              title="Update stock"
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-3 items-center">
                          <Link
                            href={`/admin/products/analytics/${product.id}`}
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="View analytics"
                          >
                            <BarChartIcon fontSize="small" />
                          </Link>
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                            title="Edit product"
                          >
                            <EditIcon fontSize="small" />
                          </Link>
                          <button
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete product"
                          >
                            {deletingId === product.id ? (
                              <span className="text-xs">Deleting...</span>
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
