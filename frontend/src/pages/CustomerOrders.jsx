import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    Calendar, 
    ArrowRight, 
    ShoppingBag, 
    MapPin, 
    CreditCard,
    AlertTriangle
} from 'lucide-react';

export const CustomerOrders = ({ setView }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await orderAPI.getMyOrders();
            if (res.success) {
                setOrders(res.orders);
            }
        } catch (err) {
            console.error('Failed to load orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const getStatusStep = (status) => {
        switch (status) {
            case 'pending': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            case 'cancelled': return 0;
            default: return 1;
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading your order history...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">No Orders Found</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    You have not placed any orders yet. Discover high-demand tech products and order today.
                </p>
                <button
                    onClick={() => setView('shop')}
                    className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
                >
                    Browse Catalog
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders & Shipments</h1>
                <p className="text-sm text-slate-500 mt-1">Live fulfillment tracker with automated warehouse stage updates</p>
            </div>

            <div className="space-y-6">
                {orders.map((order) => {
                    const step = getStatusStep(order.status);
                    const isCancelled = order.status === 'cancelled';

                    return (
                        <div
                            key={order.id}
                            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
                        >
                            {/* Header Info */}
                            <div className="p-6 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-black text-base text-slate-900">
                                            #{order.order_number}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-slate-200 text-slate-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Placed on {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs text-slate-400 block font-medium">Order Total</span>
                                    <span className="text-xl font-black text-slate-900">
                                        ${Number(order.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking Timeline Progress Bar */}
                            {!isCancelled ? (
                                <div className="px-6 py-6 border-b border-slate-100">
                                    <div className="relative">
                                        <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-slate-100">
                                            <div
                                                style={{ width: `${(step / 4) * 100}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
                                            ></div>
                                        </div>

                                        <div className="grid grid-cols-4 text-center text-xs font-semibold">
                                            <div className={step >= 1 ? 'text-indigo-600' : 'text-slate-400'}>
                                                <Clock className="w-4 h-4 mx-auto mb-1" />
                                                <span>Order Placed</span>
                                            </div>
                                            <div className={step >= 2 ? 'text-indigo-600' : 'text-slate-400'}>
                                                <Package className="w-4 h-4 mx-auto mb-1" />
                                                <span>Processing</span>
                                            </div>
                                            <div className={step >= 3 ? 'text-indigo-600' : 'text-slate-400'}>
                                                <Truck className="w-4 h-4 mx-auto mb-1" />
                                                <span>Shipped</span>
                                            </div>
                                            <div className={step >= 4 ? 'text-emerald-600' : 'text-slate-400'}>
                                                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                                                <span>Delivered</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex items-center gap-2 text-xs font-medium text-red-700">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>This order was cancelled and inventory quantities were automatically restored.</span>
                                </div>
                            )}

                            {/* Items Breakdown */}
                            <div className="p-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    Order Items ({order.items?.length || 0})
                                </h4>

                                <div className="divide-y divide-slate-100">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_name}
                                                    className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        SKU: {item.sku} • Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-slate-900">
                                                ${Number(item.subtotal).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>Shipping: {order.shipping_address}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CreditCard className="w-4 h-4 text-slate-400" />
                                        <span>Paid via {order.payment_method}</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
