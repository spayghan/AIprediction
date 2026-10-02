import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { 
    CreditCard, 
    Truck, 
    CheckCircle2, 
    ArrowLeft, 
    ArrowRight,
    AlertCircle
} from 'lucide-react';

export const Checkout = ({ setView }) => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [shippingAddress, setShippingAddress] = useState(user?.address || '742 Evergreen Terrace, Springfield, OR 97477');
    const [recipientName, setRecipientName] = useState(user?.name || '');
    const [recipientPhone, setRecipientPhone] = useState(user?.phone || '+1-555-0144');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [orderNotes, setOrderNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    const shippingFee = cartTotal > 1500 ? 0 : 150.00;
    const tax = cartTotal * 0.07;
    const grandTotal = cartTotal + shippingFee + tax;

    const formatINR = (val) => {
        return '₹' + Number(val || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                shippingAddress: `${recipientName} | ${shippingAddress} | Tel: ${recipientPhone}`,
                paymentMethod,
                notes: orderNotes
            };

            const res = await orderAPI.create(payload);
            if (res.success) {
                setConfirmedOrder({
                    orderNumber: res.orderNumber,
                    total: res.totalAmount
                });
                clearCart();
            }
        } catch (err) {
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (confirmedOrder) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                        Order Confirmed &amp; Stock Reserved
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">Thank You For Your Order!</h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Your order reference is <span className="font-mono font-bold text-slate-900">#{confirmedOrder.orderNumber}</span>.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Our warehouse has deducted inventory stock and scheduled packaging.
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setView('customer-orders')}
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md"
                        >
                            Track In My Orders
                        </button>
                        <button
                            onClick={() => setView('shop')}
                            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
                        >
                            Back to Store
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button
                onClick={() => setView('cart')}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Cart
            </button>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
                Order Checkout &amp; Fulfillment
            </h1>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Checkout Form */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                        
                        {/* Shipping Destination */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-600" /> Shipping Destination
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Full Recipient Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        placeholder="Alex Johnson"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Delivery Street Address
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="742 Evergreen Terrace, Springfield, OR"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Contact Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={recipientPhone}
                                        onChange={(e) => setRecipientPhone(e.target.value)}
                                        placeholder="+1-555-0144"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Order / Delivery Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="Gate access code or front door instructions..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Method
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['Credit Card', 'PayPal', 'Apple Pay', 'Cash on Delivery'].map((method) => (
                                    <label
                                        key={method}
                                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer transition text-center ${
                                            paymentMethod === method
                                                ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method}
                                            checked={paymentMethod === method}
                                            onChange={() => setPaymentMethod(method)}
                                            className="hidden"
                                        />
                                        <span className="text-xs">{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || cartItems.length === 0}
                            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-100 transition disabled:opacity-50"
                        >
                            {loading ? 'Validating Stock & Processing...' : `Place Order • ${formatINR(grandTotal)}`}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Items in Checkout Sidebar */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
                        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                            Items in Order ({cartItems.length})
                        </h2>

                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-2 my-2">
                            {cartItems.map((item) => (
                                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                                        <div>
                                            <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                                            <span className="text-slate-400 text-[11px]">Qty: {item.quantity} &times; {formatINR(item.price)}</span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-900 shrink-0">
                                        {formatINR(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-800">{formatINR(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Shipping</span>
                                <span className="font-semibold text-slate-800">
                                    {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Sales Tax</span>
                                <span className="font-semibold text-slate-800">{formatINR(tax)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                                <span>Total to Pay</span>
                                <span className="text-blue-600 font-extrabold">{formatINR(grandTotal)}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};