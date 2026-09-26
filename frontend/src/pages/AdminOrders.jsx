import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Check, 
    AlertCircle, 
    Eye, 
    Calendar, 
    MapPin, 
    CreditCard, 
    X, 
    RefreshCw,
    Truck,
    Package
} from 'lucide-react';

export const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await orderAPI.getAllOrders({
                status: statusFilter || undefined,
                search: search || undefined
            });
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
    }, [statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadOrders();
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await orderAPI.updateStatus(orderId, newStatus);
            if (res.success) {
                setActionMsg(res.message);
                setTimeout(() => setActionMsg(''), 4000);
                loadOrders();
            }
        } catch (err) {
            alert(err.message || 'Failed to update order status');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Customer Orders & Fulfillment Registry
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Dispatch shipments, advance fulfillment stages, or process cancellations with auto-stock restock
                    </p>
                </div>

                <button
                    onClick={loadOrders}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition self-start sm:self-auto"
                    title="Refresh Orders"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {actionMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Search order #, customer, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="absolute right-1.5 top-1 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-semibold"
                    >
                        Filter
                    </button>
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                        <option value="">All Fulfillment Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing (Pick/Pack)</option>
                        <option value="shipped">Shipped (In Transit)</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled (Restocked)</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Order Number</th>
                                <th className="py-3.5 px-4">Customer Details</th>
                                <th className="py-3.5 px-4">Placement Date</th>
                                <th className="py-3.5 px-4">Items</th>
                                <th className="py-3.5 px-4">Total Amount</th>
                                <th className="py-3.5 px-4">Current Status</th>
                                <th className="py-3.5 px-4">Fulfillment Action</th>
                                <th className="py-3.5 px-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((ord) => (
                                <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                                        #{ord.order_number}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className="font-bold text-slate-900 block">{ord.customer_name}</span>
                                        <span className="text-[11px] text-slate-400">{ord.customer_email}</span>
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                                        {new Date(ord.created_at).toLocaleDateString()}
                                    </td>

                                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                                        {ord.items?.length || 0} line items
                                    </td>

                                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                                        ${Number(ord.total_amount).toFixed(2)}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                            ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            ord.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                                            ord.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {ord.status}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <select
                                            value={ord.status}
                                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled (Restock)</option>
                                        </select>
                                    </td>

                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(ord)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                                            title="View Order Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Inspection Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Order #{selectedOrder.order_number}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Customer: {selectedOrder.customer_name} ({selectedOrder.customer_email})
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Shipping Address:</span>
                                </div>
                                <p className="text-slate-600 pl-5">{selectedOrder.shipping_address}</p>
                            </div>

                            <div>
                                <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Order Line Items
                                </h4>
                                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <img src={item.image_url} alt={item.product_name} className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-900">{item.product_name}</p>
                                                    <span className="text-[11px] text-slate-400 font-mono">SKU: {item.sku} • Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-slate-900">${Number(item.subtotal).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
                                <span className="font-bold text-slate-600">Total Order Value</span>
                                <span className="text-lg font-black text-indigo-600">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
