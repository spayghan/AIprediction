import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight, 
    ShoppingBag, 
    ShieldCheck, 
    Truck, 
    ArrowLeft,
    AlertCircle
} from 'lucide-react';

export const Cart = ({ setView }) => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated } = useAuth();

    const shippingFee = cartTotal > 150 || cartTotal === 0 ? 0 : 12.00;
    const tax = cartTotal * 0.07;
    const grandTotal = cartTotal + shippingFee + tax;

    const handleCheckoutProceed = () => {
        if (!isAuthenticated) {
            setView('customer-login');
        } else {
            setView('checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Explore our electronics catalog with real-time stock availability and add products to your cart.
                </p>
                <button
                    onClick={() => setView('shop')}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    <ArrowLeft className="w-4 h-4" /> Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                    <p className="text-sm text-slate-500 mt-1">Review your inventory reservations before order confirmation</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
                >
                    Clear All Items
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between shadow-xs"
                        >
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                                />
                                <div>
                                    <span className="text-[11px] font-mono text-slate-400 block">{item.sku}</span>
                                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Unit Price: <span className="font-semibold text-slate-800">${item.price.toFixed(2)}</span>
                                    </p>
                                    <span className="text-[11px] font-semibold text-emerald-600">
                                        Warehouse Stock: {item.stock_quantity} available
                                    </span>
                                </div>
                            </div>

                            {/* Quantity controls & Price */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-2 text-slate-600 hover:text-slate-900 transition"
                                        title="Decrease quantity"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock_quantity}
                                        className="p-2 text-slate-600 hover:text-slate-900 transition disabled:opacity-40"
                                        title="Increase quantity"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="text-right min-w-[80px]">
                                    <span className="text-base font-extrabold text-slate-900 block">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                                    title="Remove item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setView('shop')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping More Electronics
                    </button>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm sticky top-24">
                        <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">
                            Order Summary
                        </h2>

                        <div className="space-y-3 py-4 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-800">${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Estimated Shipping</span>
                                <span className="font-bold text-slate-800">
                                    {shippingFee === 0 ? <span className="text-emerald-600">Free ($150+ order)</span> : `$${shippingFee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Sales Tax (7%)</span>
                                <span className="font-bold text-slate-800">${tax.toFixed(2)}</span>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                                <span>Grand Total</span>
                                <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckoutProceed}
                            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {!isAuthenticated && (
                            <p className="text-[11px] text-center text-slate-400 mt-3">
                                You will be asked to sign in with your customer account during checkout.
                            </p>
                        )}

                        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-indigo-500" />
                                <span>Express Warehouse Dispatch within 24h</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span>Verified Inventory Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
