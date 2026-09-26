import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
    Search, 
    Filter, 
    ShoppingCart, 
    Check, 
    AlertCircle, 
    Eye, 
    Sparkles, 
    SlidersHorizontal,
    Box,
    X,
    Star
} from 'lucide-react';

export const Shop = ({ setView }) => {
    const { addToCart, cartItems } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addedId, setAddedId] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                productAPI.getAll({
                    search: search || undefined,
                    category: selectedCategory || undefined,
                    stockStatus: stockFilter || undefined,
                    sortBy: sortBy || undefined
                }),
                productAPI.getCategories()
            ]);

            if (prodRes.success) setProducts(prodRes.products);
            if (catRes.success) setCategories(catRes.categories);
        } catch (err) {
            console.error('Failed to load shop items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedCategory, stockFilter, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadData();
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 mb-10 shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> E-Commerce Storefront & Real-Time Logistics
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        Next-Gen Consumer Tech. <br />
                        <span className="bg-gradient-to-r from-indigo-300 via-emerald-300 to-white bg-clip-text text-transparent">
                            Live Inventory Synced.
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
                        Shop premium electronics, audio gear, and smart home appliances with automatic warehouse reservation and immediate stock replenishment tracking.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => {
                                const el = document.getElementById('catalog-section');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition shadow-md"
                        >
                            Browse Inventory Catalog
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div id="catalog-section" className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 shadow-xs">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            placeholder="Search by product name, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                            Search
                        </button>
                    </form>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Stock filter */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                            <Box className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option value="">All Stock Levels</option>
                                <option value="in_stock">In Stock Only</option>
                                <option value="low_stock">Low Stock (Urgent)</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option value="">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="stock_asc">Stock Quantity: Low to High</option>
                            </select>
                        </div>
                    </div>

                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            selectedCategory === ''
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(String(cat.id))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                selectedCategory === String(cat.id)
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat.name} ({cat.product_count || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                            <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                    <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or filters</p>
                    <button
                        onClick={() => { setSearch(''); setSelectedCategory(''); setStockFilter(''); setSortBy(''); }}
                        className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl text-xs hover:bg-indigo-100 transition"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const inCart = cartItems.find(item => item.id === product.id);
                        const isOutOfStock = product.stock_quantity <= 0;
                        const isLowStock = !isOutOfStock && product.stock_quantity <= product.reorder_point;

                        return (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                            >
                                {/* Image Box */}
                                <div className="relative h-52 bg-slate-100 overflow-hidden">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    
                                    {/* Stock Badge */}
                                    <div className="absolute top-3 left-3">
                                        {isOutOfStock ? (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-xs">
                                                Sold Out
                                            </span>
                                        ) : isLowStock ? (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                                                Only {product.stock_quantity} Left!
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                                                {product.stock_quantity} In Stock
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick View Button */}
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-indigo-600 rounded-xl shadow-md transition opacity-0 group-hover:opacity-100"
                                        title="Quick Inspection"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                                            <span>{product.category_name || 'Electronics'}</span>
                                            <span className="font-mono text-slate-400">{product.sku}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>

                                    {/* Price & Add to Cart */}
                                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-slate-400 block font-medium">Price</span>
                                            <span className="text-xl font-extrabold text-slate-900">
                                                ${Number(product.price).toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isOutOfStock}
                                            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                                                isOutOfStock
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : addedId === product.id
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            }`}
                                        >
                                            {addedId === product.id ? (
                                                <>
                                                    <Check className="w-4 h-4" /> Added!
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-4 h-4" /> Add
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative h-64 bg-slate-100">
                            <img
                                src={selectedProduct.image_url}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span className="font-semibold uppercase tracking-wider text-indigo-600">{selectedProduct.category_name}</span>
                                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">SKU: {selectedProduct.sku}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">{selectedProduct.name}</h2>
                            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{selectedProduct.description}</p>
                            
                            {/* Inventory specs */}
                            <div className="grid grid-cols-3 gap-3 my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Current Stock</span>
                                    <span className={`text-base font-extrabold ${selectedProduct.stock_quantity <= selectedProduct.reorder_point ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {selectedProduct.stock_quantity} units
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Safety Stock</span>
                                    <span className="text-base font-extrabold text-slate-700">
                                        {selectedProduct.safety_stock_level} units
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Lead Time</span>
                                    <span className="text-base font-extrabold text-indigo-600">
                                        {selectedProduct.lead_time_days || 5} days
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Price</span>
                                    <span className="text-3xl font-extrabold text-slate-900">${Number(selectedProduct.price).toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleAddToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock_quantity <= 0}
                                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 transition disabled:opacity-50"
                                >
                                    <ShoppingCart className="w-4 h-4" /> Add to Order Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
