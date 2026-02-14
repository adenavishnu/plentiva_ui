"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProductAnalytics } from "@/types";
import { getProductAnalytics } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import UpdateIcon from "@mui/icons-material/Update";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function ProductAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      const data = getProductAnalytics(productId);
      if (!data) {
        router.push("/admin/products");
        return;
      }
      setAnalytics(data);
      setLoading(false);
    };
    
    loadAnalytics();
  }, [productId, router]);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initial':
        return <InventoryIcon className="text-blue-600" fontSize="small" />;
      case 'add':
        return <TrendingUpIcon className="text-green-600" fontSize="small" />;
      case 'remove':
        return <TrendingDownIcon className="text-orange-600" fontSize="small" />;
      case 'sold':
        return <ShoppingCartIcon className="text-purple-600" fontSize="small" />;
      default:
        return <UpdateIcon className="text-gray-600" fontSize="small" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      initial: 'bg-blue-100 text-blue-700',
      add: 'bg-green-100 text-green-700',
      remove: 'bg-orange-100 text-orange-700',
      sold: 'bg-purple-100 text-purple-700'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowBackIcon fontSize="small" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{analytics.productName}</h1>
        <p className="mt-1 text-gray-600">Product ID: {analytics.productId}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Initial Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Initial Stock</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.initialStock}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <InventoryIcon className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Added */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Added</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{analytics.totalAdded}</p>
              <p className="mt-1 text-xs text-gray-500">{analytics.totalUpdates} updates</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUpIcon className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Sold */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sold</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">{analytics.totalSold}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <ShoppingCartIcon className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Stock</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.currentStock}</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <InventoryIcon className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AttachMoneyIcon fontSize="large" />
              <p className="text-lg font-medium">Total Revenue</p>
            </div>
            <p className="text-5xl font-bold">{formatPrice(analytics.totalRevenue, 'INR')}</p>
            <p className="mt-2 text-blue-100">
              From {analytics.totalSold} units sold
            </p>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory History</h2>
        
        {analytics.history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No history available</p>
        ) : (
          <div className="space-y-4">
            {[...analytics.history].reverse().map((update, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="mt-1">
                  {getTypeIcon(update.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getTypeBadge(update.type)}`}>
                          {update.type.toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {update.quantity} units
                        </span>
                      </div>
                      {update.notes && (
                        <p className="text-sm text-gray-600">{update.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(update.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(analytics.lastUpdated)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stock Turnover</p>
            <p className="text-sm font-semibold text-gray-900">
              {analytics.initialStock > 0 
                ? ((analytics.totalSold / analytics.initialStock) * 100).toFixed(1) 
                : 0}% of initial stock
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Revenue per Unit</p>
            <p className="text-sm font-semibold text-gray-900">
              {analytics.totalSold > 0 
                ? formatPrice(analytics.totalRevenue / analytics.totalSold, 'INR')
                : formatPrice(0, 'INR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
