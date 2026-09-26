import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
    ShoppingBag, 
    ShoppingCart, 
    Layers, 
    TrendingUp, 
    ClipboardList, 
    Truck, 
    User, 
    LogOut, 
    ShieldCheck, 
    Store,
    Sparkles
} from 'lucide-react';

export const Navbar = ({ currentView, setView }) => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(isAdmin ? 'admin-dashboard' : 'shop')}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                                    NexStore
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    E-Commerce
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-500" /> AI-Driven Inventory & Orders
                            </p>
                        </div>
                    </div>

                    {/* Navigation Items based on active role & portal */}
                    <nav className="hidden md:flex items-center gap-1">
                        {/* Customer Nav */}
                        {(!user || user.role === 'customer') && (
                            <>
                                <button
                                    onClick={() => setView('shop')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                                        currentView === 'shop' 
                                            ? 'bg-indigo-50 text-indigo-700' 
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    <Store className="w-4 h-4" /> Shop Catalog
                                </button>

                                {isAuthenticated && (
                                    <button
                                        onClick={() => setView('customer-orders')}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                                            currentView === 'customer-orders' 
                                                ? 'bg-indigo-50 text-indigo-700' 
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        <ClipboardList className="w-4 h-4" /> My Orders
                                    </button>
                                )}
                            </>
                        )}

                        {/* Admin Navigation */}
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setView('admin-dashboard')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                        currentView === 'admin-dashboard' 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <Layers className="w-4 h-4" /> Overview
                                </button>
                                <button
                                    onClick={() => setView('admin-inventory')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                        currentView === 'admin-inventory' 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <ShoppingBag className="w-4 h-4" /> Inventory Stock
                                </button>
                                <button
                                    onClick={() => setView('admin-analytics')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                        currentView === 'admin-analytics' 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : 'text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                >
                                    <TrendingUp className="w-4 h-4" /> AI Analytics
                                </button>
                                <button
                                    onClick={() => setView('admin-orders')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                        currentView === 'admin-orders' 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <ClipboardList className="w-4 h-4" /> Orders
                                </button>
                                <button
                                    onClick={() => setView('admin-suppliers')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                        currentView === 'admin-suppliers' 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <Truck className="w-4 h-4" /> Suppliers & POs
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Right Action Icons & Login Pages Navigation */}
                    <div className="flex items-center gap-3">
                        {/* Cart Button (Always visible for shoppers) */}
                        {(!user || user.role === 'customer') && (
                            <button
                                onClick={() => setView('cart')}
                                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Shopping Cart"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* If Logged in */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                                        isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setView('shop');
                                    }}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            /* Two Separate Login Portals Switches */
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setView('customer-login')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                        currentView === 'customer-login' || currentView === 'customer-register'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    Customer Login
                                </button>

                                <button
                                    onClick={() => setView('admin-login')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        currentView === 'admin-login'
                                            ? 'bg-indigo-700 text-white shadow-sm'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                                    }`}
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Admin Login
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};
