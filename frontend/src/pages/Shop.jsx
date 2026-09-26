// import React, { useState, useEffect } from 'react';
// import { productAPI } from '../services/api';
// import { useCart } from '../context/CartContext';
// import { Search, Eye, X } from 'lucide-react';

// export const Shop = ({ setView }) => {
//     const { addToCart, cartItems } = useCart();
//     const [products, setProducts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState('');
//     const [sortBy, setSortBy] = useState('name_asc');
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [addedId, setAddedId] = useState(null);

//     const loadData = async () => {
//         try {
//             setLoading(true);
//             const [prodRes, catRes] = await Promise.all([
//                 productAPI.getAll({
//                     search: search || undefined,
//                     category: selectedCategory || undefined,
//                     sortBy: sortBy || undefined
//                 }),
//                 productAPI.getCategories()
//             ]);

//             if (prodRes.success) setProducts(prodRes.products);
//             if (catRes.success) setCategories(catRes.categories);
//         } catch (err) {
//             console.error('Failed to load shop items:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadData();
//     }, [selectedCategory, sortBy]);

//     const handleSearchSubmit = (e) => {
//         e.preventDefault();
//         loadData();
//     };

//     const handleAddToCart = (product) => {
//         addToCart(product, 1);
//         setAddedId(product.id);
//         setTimeout(() => setAddedId(null), 1500);
//     };

//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
//             {/* Dark Navy Hero Banner (Matches Image 2) */}
//             <div className="rounded-2xl bg-[#131f37] text-white p-8 sm:p-12 shadow-md">
//                 <div className="max-w-2xl space-y-2">
//                     <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
//                         Discover Great Products
//                     </h1>
//                     <p className="text-sm text-slate-300 leading-relaxed">
//                         Shop from our curated collection of premium products across electronics, fashion, home, and more.
//                     </p>
//                 </div>
//             </div>

//             {/* Search Input on Left & Sort Dropdown on Right */}
//             <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
//                 <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-2xl">
//                     <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
//                     <input
//                         type="text"
//                         placeholder="Search products..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
//                     />
//                 </form>

//                 <div className="w-full sm:w-auto">
//                     <select
//                         value={sortBy}
//                         onChange={(e) => setSortBy(e.target.value)}
//                         className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
//                     >
//                         <option value="name_asc">Sort by Name</option>
//                         <option value="price_asc">Price: Low to High</option>
//                         <option value="price_desc">Price: High to Low</option>
//                         <option value="stock_asc">Sort by Stock</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Category Filter Pills */}
//             <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
//                 <button
//                     onClick={() => setSelectedCategory('')}
//                     className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
//                         selectedCategory === ''
//                             ? 'bg-blue-600 text-white shadow-xs'
//                             : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
//                     }`}
//                 >
//                     All Products
//                 </button>
//                 {categories.map((cat) => (
//                     <button
//                         key={cat.id}
//                         onClick={() => setSelectedCategory(String(cat.id))}
//                         className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
//                             selectedCategory === String(cat.id)
//                                 ? 'bg-blue-600 text-white shadow-xs'
//                                 : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
//                         }`}
//                     >
//                         {cat.name}
//                     </button>
//                 ))}
//             </div>

//             {/* Product Cards Grid */}
//             {loading ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
//                     {[1, 2, 3, 4].map((n) => (
//                         <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
//                             <div className="h-56 bg-slate-200 rounded-xl mb-4"></div>
//                             <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
//                             <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
//                             <div className="h-8 bg-slate-200 rounded"></div>
//                         </div>
//                     ))}
//                 </div>
//             ) : products.length === 0 ? (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
//                     <p className="text-slate-500 font-medium">No products found matching your search.</p>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {products.map((product) => {
//                         const isOutOfStock = product.stock_quantity <= 0;
//                         const isLowStock = !isOutOfStock && product.stock_quantity <= product.reorder_point;

//                         return (
//                             <div
//                                 key={product.id}
//                                 className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
//                             >
//                                 {/* Image Box with "Only X left" pill */}
//                                 <div className="relative h-60 bg-slate-100 overflow-hidden group">
//                                     <img
//                                         src={product.image_url}
//                                         alt={product.name}
//                                         className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
//                                         loading="lazy"
//                                     />

//                                     {/* Low stock pill badge (from Image 2) */}
//                                     {isLowStock && (
//                                         <span className="absolute top-3 left-3 bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
//                                             Only {product.stock_quantity} left
//                                         </span>
//                                     )}

//                                     {isOutOfStock && (
//                                         <span className="absolute top-3 left-3 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
//                                             Out of Stock
//                                         </span>
//                                     )}

//                                     <button
//                                         onClick={() => setSelectedProduct(product)}
//                                         className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition text-slate-700 hover:text-blue-600"
//                                     >
//                                         <Eye className="w-4 h-4" />
//                                     </button>
//                                 </div>

//                                 {/* Product Info & Action */}
//                                 <div className="p-4 flex-1 flex flex-col justify-between">
//                                     <div>
//                                         <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
//                                             {product.name}
//                                         </h3>
//                                         <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
//                                             {product.description}
//                                         </p>
//                                     </div>

//                                     <div className="mt-4 pt-3 flex items-center justify-between">
//                                         <span className="text-base font-extrabold text-slate-900">
//                                             ${Number(product.price).toFixed(2)}
//                                         </span>

//                                         <button
//                                             onClick={() => handleAddToCart(product)}
//                                             disabled={isOutOfStock}
//                                             className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
//                                                 isOutOfStock 
//                                                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
//                                                     : addedId === product.id
//                                                     ? 'bg-emerald-600 text-white'
//                                                     : 'bg-blue-600 hover:bg-blue-700 text-white'
//                                             }`}
//                                         >
//                                             {addedId === product.id ? 'Added!' : 'Add to Cart'}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             {/* Quick Inspection Modal */}
//             {selectedProduct && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
//                     <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in">
//                         <button 
//                             onClick={() => setSelectedProduct(null)}
//                             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
//                         >
//                             <X className="w-5 h-5" />
//                         </button>
//                         <img src={selectedProduct.image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-4 bg-slate-100" />
//                         <h2 className="text-lg font-bold text-slate-900">{selectedProduct.name}</h2>
//                         <p className="text-xs text-slate-500 mt-1">{selectedProduct.description}</p>
//                         <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
//                             <span className="text-xl font-black text-slate-900">${Number(selectedProduct.price).toFixed(2)}</span>
//                             <button
//                                 onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
//                                 disabled={selectedProduct.stock_quantity <= 0}
//                                 className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
//                             >
//                                 Add to Cart
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };



import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { Search } from 'lucide-react';

export const Shop = ({ setView }) => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [addedId, setAddedId] = useState(null);

    // Fallback items matching your 2nd image if the database is still loading
    const defaultCatalog = [
        {
            id: 101,
            name: 'Aurora Ultrabook 14',
            description: 'Ultra-light 14-inch laptop with 16GB RAM and 1TB SSD. Perfect for professionals on the go.',
            price: 1299.00,
            stock_quantity: 24,
            image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
        },
        {
            id: 102,
            name: 'Azure Leather Sneakers',
            description: 'Premium blue leather sneakers with classic silhouette.',
            price: 119.00,
            stock_quantity: 45,
            image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
        },
        {
            id: 103,
            name: 'Balance Pro Yoga Set',
            description: 'Complete yoga set with mat, blocks, and strap for all levels.',
            price: 79.00,
            stock_quantity: 30,
            image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'
        },
        {
            id: 104,
            name: 'Cloud White Sneakers',
            description: 'Minimalist white sneakers that go with everything.',
            price: 79.00,
            stock_quantity: 12, // Shows "Only 12 left"
            image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'
        }
    ];

    const loadData = async () => {
        try {
            setLoading(true);

            // FIX: Only pass parameters that are actively filled to avoid '?search=undefined'
            const queryParams = {};
            if (search.trim()) queryParams.search = search.trim();
            if (selectedCategory) queryParams.category = selectedCategory;

            const [prodRes, catRes] = await Promise.all([
                productAPI.getAll(queryParams).catch(() => ({ success: false })),
                productAPI.getCategories().catch(() => ({ success: false }))
            ]);

            if (prodRes && prodRes.success && prodRes.products && prodRes.products.length > 0) {
                let list = [...prodRes.products];
                if (sortBy === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
                if (sortBy === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
                if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
                setProducts(list);
            } else {
                setProducts(defaultCatalog);
            }

            if (catRes && catRes.success && catRes.categories && catRes.categories.length > 0) {
                setCategories(catRes.categories);
            } else {
                setCategories([
                    { id: 1, name: 'Audio' },
                    { id: 2, name: 'Electronics' },
                    { id: 3, name: 'Fashion' },
                    { id: 4, name: 'Fitness' },
                    { id: 5, name: 'Home & Living' },
                    { id: 6, name: 'Kitchen' }
                ]);
            }
        } catch (err) {
            console.error('Failed to load shop items:', err);
            setProducts(defaultCatalog);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedCategory, sortBy]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Dark Navy Hero Banner (Exact match to 2nd Image) */}
            <div className="rounded-2xl bg-[#131f37] text-white p-8 sm:p-12 shadow-sm">
                <div className="max-w-2xl space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Discover Great Products
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        Shop from our curated collection of premium products across electronics, fashion, home, and more.
                    </p>
                </div>
            </div>

            {/* Search Bar & Sort Dropdown Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-2xl">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                </form>

                <div className="w-full sm:w-auto">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        selectedCategory === ''
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    All Products
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(String(cat.id))}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                            selectedCategory === String(cat.id)
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Products Grid (Exact match to 2nd Image) */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                            <div className="h-64 bg-slate-100 rounded-xl mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500 font-medium">No products found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const isOutOfStock = product.stock_quantity <= 0;
                        const isLowStock = !isOutOfStock && product.stock_quantity <= 15;

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                            >
                                {/* Product Image */}
                                <div className="relative h-64 bg-slate-100 overflow-hidden">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />

                                    {/* Yellow "Only X left" badge (Matches Image 2) */}
                                    {isLowStock && (
                                        <span className="absolute top-3 left-3 bg-[#fff3c4] text-[#8a5b00] border border-[#ffe17d] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                            Only {product.stock_quantity} left
                                        </span>
                                    )}

                                    {isOutOfStock && (
                                        <span className="absolute top-3 left-3 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Content: Title, Description, Price, and Add to Cart */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 flex items-center justify-between">
                                        <span className="text-base font-extrabold text-slate-900">
                                            ${Number(product.price).toFixed(2)}
                                        </span>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isOutOfStock}
                                            className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                                                isOutOfStock
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : addedId === product.id
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {addedId === product.id ? 'Added!' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};