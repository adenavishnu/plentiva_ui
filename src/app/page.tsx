"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/categoriesSlice';
import ProductCard from "@/components/ProductCard";
import { getAllProductsFromAPI } from "@/lib/products";
import { Product } from "@/types";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { items: categoriesList } = useAppSelector(state => state.categories);
  
  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getAllProductsFromAPI();
      setProducts(allProducts);
      setIsLoading(false);
    };
    loadProducts();
    // @ts-expect-error
    dispatch(fetchCategories());
  }, [dispatch]);

  // Use Redux categories
  const categories = useMemo(() => {
    return categoriesList.map(c => c.name).sort();
  }, [categoriesList]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "0-100":
          filtered = filtered.filter(p => p.price < 100);
          break;
        case "100-300":
          filtered = filtered.filter(p => p.price >= 100 && p.price < 300);
          break;
        case "300-500":
          filtered = filtered.filter(p => p.price >= 300 && p.price < 500);
          break;
        case "500+":
          filtered = filtered.filter(p => p.price >= 500);
          break;
      }
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "in-stock") {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (stockFilter === "out-of-stock") {
        filtered = filtered.filter(p => p.stock === 0);
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
  }, [products, searchQuery, selectedCategory, priceRange, stockFilter, sortBy]);

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Plentiva</span>
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Browse products and pay seamlessly via PayPal, Razorpay, or PhonePe
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category-select" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FilterListIcon fontSize="small" />
              Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label htmlFor="price-range-select" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FilterListIcon fontSize="small" />
              Price Range
            </label>
            <select
              id="price-range-select"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Prices</option>
              <option value="0-100">Under ₹100</option>
              <option value="100-300">₹100 - ₹300</option>
              <option value="300-500">₹300 - ₹500</option>
              <option value="500+">₹500+</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label htmlFor="stock-filter-select" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FilterListIcon fontSize="small" />
              Availability
            </label>
            <select
              id="stock-filter-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by-select" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <SortIcon fontSize="small" />
              Sort By
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
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

      {/* Product Grid */}
      {isLoading ? (
        <div className="text-center text-gray-500">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500">
          {searchQuery || selectedCategory !== "all" || priceRange !== "all" || stockFilter !== "all" 
            ? "No products match your filters" 
            : "No products available"}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
