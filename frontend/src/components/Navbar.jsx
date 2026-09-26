// import React from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import { 
//     Boxes, 
//     ShoppingCart, 
//     LogOut, 
//     Shield
// } from 'lucide-react';

// export const Navbar = ({ currentView, setView }) => {
//     const { user, isAuthenticated, isAdmin, logout } = useAuth();
//     const { cartCount } = useCart();

//     const isLanding = currentView === 'landing';
//     const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'T';

//     return (
//         <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex items-center justify-between h-16">
                    
//                     {/* Brand / Logo + Admin Badge */}
//                     <div className="flex items-center gap-6">
//                         <div 
//                             className="flex items-center gap-2 cursor-pointer" 
//                             onClick={() => setView(isAdmin ? 'admin-dashboard' : (isAuthenticated ? 'shop' : 'landing'))}
//                         >
//                             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
//                                 <Boxes className="w-5 h-5" />
//                             </div>
//                             <span className="text-xl font-extrabold tracking-tight text-slate-900">
//                                 StockFlow
//                             </span>
//                             {isAdmin && (
//                                 <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
//                                     Admin
//                                 </span>
//                             )}
//                         </div>

//                         {/* Admin Navigation Tabs (Exact Match to Screenshot) */}
//                         {isAdmin && (
//                             <nav className="hidden md:flex items-center gap-1.5">
//                                 <button
//                                     onClick={() => setView('admin-dashboard')}
//                                     className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                         currentView === 'admin-dashboard' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Dashboard
//                                 </button>
//                                 <button
//                                     onClick={() => setView('admin-inventory')}
//                                     className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                         currentView === 'admin-inventory' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Products
//                                 </button>
//                                 <button
//                                     onClick={() => setView('admin-orders')}
//                                     className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                         currentView === 'admin-orders' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Orders
//                                 </button>
//                                 <button
//                                     onClick={() => setView('admin-analytics')}
//                                     className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                         currentView === 'admin-analytics' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Analytics
//                                 </button>
//                                 <button
//                                     onClick={() => setView('admin-suppliers')}
//                                     className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                         currentView === 'admin-suppliers' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Inventory
//                                 </button>
//                             </nav>
//                         )}

//                         {/* Customer Navigation Links */}
//                         {!isAdmin && !isLanding && (
//                             <nav className="hidden md:flex items-center gap-1">
//                                 <button
//                                     onClick={() => setView('shop')}
//                                     className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                         currentView === 'shop' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Shop
//                                 </button>
//                                 {isAuthenticated && (
//                                     <button
//                                         onClick={() => setView('customer-orders')}
//                                         className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
//                                             currentView === 'customer-orders' 
//                                                 ? 'bg-blue-50 text-blue-600 font-bold' 
//                                                 : 'text-slate-600 hover:text-slate-900'
//                                         }`}
//                                     >
//                                         My Orders
//                                     </button>
//                                 )}
//                                 <button
//                                     onClick={() => setView('cart')}
//                                     className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
//                                         currentView === 'cart' 
//                                             ? 'bg-blue-50 text-blue-600 font-bold' 
//                                             : 'text-slate-600 hover:text-slate-900'
//                                     }`}
//                                 >
//                                     Cart
//                                     {cartCount > 0 && (
//                                         <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
//                                             {cartCount}
//                                         </span>
//                                     )}
//                                 </button>
//                             </nav>
//                         )}
//                     </div>

//                     {/* Right User Controls */}
//                     <div className="flex items-center gap-3">
//                         {isAuthenticated ? (
//                             <div className="flex items-center gap-3">
//                                 {/* User name & role */}
//                                 <div className="text-right hidden sm:block">
//                                     <p className="text-xs font-bold text-slate-900 leading-tight">
//                                         {user?.name || 'tushar'}
//                                     </p>
//                                     <p className="text-[11px] text-slate-400 capitalize">
//                                         {user?.role || 'Admin'}
//                                     </p>
//                                 </div>

//                                 {/* Avatar Circle */}
//                                 <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
//                                     {userInitial}
//                                 </div>

//                                 {/* Sign Out */}
//                                 <button
//                                     onClick={() => { logout(); setView(isAdmin ? 'admin-login' : 'landing'); }}
//                                     className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition ml-2"
//                                     title="Sign Out"
//                                 >
//                                     <LogOut className="w-4 h-4" />
//                                     <span className="hidden sm:inline">Sign out</span>
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="flex items-center gap-4">
//                                 <button
//                                     onClick={() => setView('customer-login')}
//                                     className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
//                                 >
//                                     Customer Login
//                                 </button>
//                                 <button
//                                     onClick={() => setView('admin-login')}
//                                     className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
//                                 >
//                                     <Shield className="w-3.5 h-3.5" /> Admin Login
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                 </div>
//             </div>
//         </header>
//     );
// };
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
    Boxes, 
    ShoppingCart, 
    LogOut, 
    Shield, 
    Database
} from 'lucide-react';

export const Navbar = ({ currentView, setView }) => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();
    const [dbInfo, setDbInfo] = useState({ isMySQL: false, label: 'Checking...' });

    // Poll backend health status to verify MySQL connection
    useEffect(() => {
        fetch('/api/health')
            .then(res => res.json())
            .then(data => {
                setDbInfo({
                    isMySQL: data.isMySQL,
                    label: data.isMySQL ? 'MySQL 8.0' : 'SQLite'
                });
            })
            .catch(() => setDbInfo({ isMySQL: false, label: 'Offline' }));
    }, [currentView]);

    const isLanding = currentView === 'landing';
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'T';

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Brand / Logo + Admin Badge + Dynamic DB Status Indicator */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div 
                            className="flex items-center gap-2 cursor-pointer" 
                            onClick={() => setView(isAdmin ? 'admin-dashboard' : (isAuthenticated ? 'shop' : 'landing'))}
                        >
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                                <Boxes className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                StockFlow
                            </span>
                            {isAdmin && (
                                <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    Admin
                                </span>
                            )}
                        </div>

                        {/* Live Database Sync Badge */}
                        <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            dbInfo.isMySQL 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                            <Database className="w-3 h-3" />
                            <span>{dbInfo.label}</span>
                        </div>

                        {/* Admin Navigation Tabs */}
                        {isAdmin && (
                            <nav className="hidden md:flex items-center gap-1.5">
                                <button
                                    onClick={() => setView('admin-dashboard')}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                        currentView === 'admin-dashboard' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setView('admin-inventory')}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                        currentView === 'admin-inventory' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Products
                                </button>
                                <button
                                    onClick={() => setView('admin-orders')}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                        currentView === 'admin-orders' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Orders
                                </button>
                                <button
                                    onClick={() => setView('admin-analytics')}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                        currentView === 'admin-analytics' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Analytics
                                </button>
                                <button
                                    onClick={() => setView('admin-suppliers')}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                                        currentView === 'admin-suppliers' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Inventory
                                </button>
                            </nav>
                        )}

                        {/* Customer Navigation Links */}
                        {!isAdmin && !isLanding && (
                            <nav className="hidden md:flex items-center gap-1">
                                <button
                                    onClick={() => setView('shop')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                                        currentView === 'shop' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Shop
                                </button>
                                {isAuthenticated && (
                                    <button
                                        onClick={() => setView('customer-orders')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                                            currentView === 'customer-orders' 
                                                ? 'bg-blue-50 text-blue-600 font-bold' 
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        My Orders
                                    </button>
                                )}
                                <button
                                    onClick={() => setView('cart')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                                        currentView === 'cart' 
                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        )}
                    </div>

                    {/* Right User Controls */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-900 leading-tight">
                                        {user?.name || 'tushar'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 capitalize">
                                        {user?.role || 'Admin'}
                                    </p>
                                </div>

                                <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
                                    {userInitial}
                                </div>

                                <button
                                    onClick={() => { logout(); setView(isAdmin ? 'admin-login' : 'landing'); }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition ml-2"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sign out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView('customer-login')}
                                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                                >
                                    Customer Login
                                </button>
                                <button
                                    onClick={() => setView('admin-login')}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                                >
                                    <Shield className="w-3.5 h-3.5" /> Admin Login
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};