import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import {
    Search,
    Eye,
    X,
    Calendar,
    CreditCard,
    MapPin,
    Package,
    CheckCircle2,
    Truck,
    Clock,
    AlertCircle
} from 'lucide-react';

export const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // FIX: Only add query parameters if they have actual text
            const queryParams = {};
            if (statusFilter && statusFilter.trim()) {
                queryParams.status = statusFilter.trim();
            }
            if (search && search.trim()) {
                queryParams.search = search.trim();
            }

            const res = await orderAPI.getAllOrders(queryParams);
            if (res && res.success && res.orders) {
                setOrders(res.orders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error('Failed to load orders:', err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchOrders();
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await orderAPI.updateStatus(orderId, newStatus);
            if (res.success) {
                setActionMsg(res.message);
                setTimeout(() => setActionMsg(''), 4000);
                fetchOrders();
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            }
        } catch (err) {
            alert(err.message || 'Failed to update order status');
        }
    };

    // Format numbers into Indian Rupee style
    const formatINR = (val) => {
        const num = Number(val || 0);
        return '₹' + num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Order Registry &amp; Fulfillment Hub
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-normal">
                    Review incoming customer orders, manage processing stages, and handle automated stock returns
                </p>
            </div>

            {actionMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {/* Search Input & Status Filter Row (Matches Image 2) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xl">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                        type="text"
                        placeholder="Search order #, customer, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        FILTER STATUS:
                    </span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                    >
                        <option value="">All Orders ({orders.length})</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                <th className="py-3.5 px-6">ORDER #</th>
                                <th className="py-3.5 px-6">CUSTOMER</th>
                                <th className="py-3.5 px-6">DATE</th>
                                <th className="py-3.5 px-6">TOTAL AMOUNT</th>
                                <th className="py-3.5 px-6">FULFILLMENT STAGE</th>
                                <th className="py-3.5 px-6 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        Loading customer orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-slate-400">
                                        No customer orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((ord) => (
                                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                                        {/* Order Number & Items Preview */}
                                        <td className="py-4 px-6">
                                            <span className="font-mono font-bold text-slate-900 block text-sm">
                                                #{ord.order_number}
                                            </span>
                                            <span className="text-[11px] text-blue-600 font-medium block mt-0.5">
                                                {ord.items?.length || 0} product{(ord.items?.length || 0) > 1 ? 's' : ''} reserved
                                            </span>
                                        </td>

                                        {/* Customer */}
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-slate-900 block text-sm">
                                                {ord.customer_name}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-normal">
                                                {ord.customer_email}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 px-6 text-slate-500 font-mono">
                                            {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>

                                        {/* Total Amount in Rupees (₹) */}
                                        <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">
                                            {formatINR(ord.total_amount)}
                                        </td>

                                        {/* Status Dropdown */}
                                        <td className="py-4 px-6">
                                            <select
                                                value={ord.status}
                                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer border-0 ${
                                                    ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                                    ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                    ord.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                                                    ord.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled (Restock)</option>
                                            </select>
                                        </td>

                                        {/* Action Button: Inspect Order & Products */}
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(ord)}
                                                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition inline-flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Inspect
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* INSPECT ORDER MODAL (Shows Ordered Products, Quantities, and Prices) */}
            {/* ========================================================================= */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Order #{selectedOrder.order_number}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Customer: <strong className="text-slate-800">{selectedOrder.customer_name}</strong> ({selectedOrder.customer_email})
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)} 
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Customer Delivery Details */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600 mb-4">
                            <p className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span><strong>Shipping Address:</strong> {selectedOrder.shipping_address}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                                <span><strong>Payment:</strong> {selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                <span><strong>Order Placed:</strong> {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                            </p>
                        </div>

                        {/* Ordered Products Section */}
                        <div className="space-y-3">
                            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-xs flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-blue-600" />
                                Ordered Products ({selectedOrder.items?.length || 0})
                            </h4>

                            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden p-2 bg-white">
                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                    selectedOrder.items.map((item) => (
                                        <div key={item.id} className="py-3 px-2 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.product_name} 
                                                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" 
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{item.product_name}</p>
                                                    <span className="font-mono text-slate-400 text-xs">
                                                        SKU: {item.sku} &bull; Qty: {item.quantity} &times; {formatINR(item.unit_price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-extrabold text-slate-900 text-sm">
                                                {formatINR(item.subtotal)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-4 text-xs text-slate-400">
                                        No items recorded for this order.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Total in Rupees (₹) */}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-base font-black text-slate-900">
                            <span>Total Amount</span>
                            <span className="text-blue-600 text-lg">
                                {formatINR(selectedOrder.total_amount)}
                            </span>
                        </div>

                        {/* Stage Update Inside Modal */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Update Fulfillment Status:
                            </span>
                            <select
                                value={selectedOrder.status}
                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 bg-slate-50 cursor-pointer"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled (Restock)</option>
                            </select>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};
// import React, { useState, useEffect } from 'react';
// import { orderAPI } from '../services/api';
// import {
//     ClipboardList,
//     Search,
//     Truck,
//     Package,
//     CheckCircle2,
//     XCircle,
//     Eye,
//     X,
//     Calendar,
//     User,
//     CreditCard,
//     MapPin
// } from 'lucide-react';

// export const AdminOrders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [statusFilter, setStatusFilter] = useState('');
//     const [search, setSearch] = useState('');
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [actionMsg, setActionMsg] = useState('');

//     const fetchOrders = async () => {
//         try {
//             setLoading(true);
//             const res = await orderAPI.getAllOrders({
//                 status: statusFilter || undefined,
//                 search: search || undefined
//             });
//             if (res.success) {
//                 setOrders(res.orders);
//             }
//         } catch (err) {
//             console.error('Failed to load orders:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchOrders();
//     }, [statusFilter]);

//     const handleSearch = (e) => {
//         e.preventDefault();
//         fetchOrders();
//     };

//     const handleStatusChange = async (orderId, newStatus) => {
//         try {
//             const res = await orderAPI.updateStatus(orderId, newStatus);
//             if (res.success) {
//                 setActionMsg(res.message);
//                 setTimeout(() => setActionMsg(''), 4000);
//                 fetchOrders();
//                 if (selectedOrder && selectedOrder.id === orderId) {
//                     setSelectedOrder({ ...selectedOrder, status: newStatus });
//                 }
//             }
//         } catch (err) {
//             alert(err.message || 'Failed to update order status');
//         }
//     };

//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
//                 <div>
//                     <h1 className="text-3xl font-black text-slate-900 tracking-tight">
//                         Order Registry & Fulfillment Hub
//                     </h1>
//                     <p className="text-xs text-slate-500 mt-1">
//                         Review incoming customer orders, manage processing stages, and handle automated stock returns
//                     </p>
//                 </div>
//             </div>

//             {actionMsg && (
//                 <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
//                     <CheckCircle2 className="w-4 h-4 text-emerald-600" />
//                     <span>{actionMsg}</span>
//                 </div>
//             )}

//             {/* Filter Bar */}
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
//                 <form onSubmit={handleSearch} className="relative w-full sm:w-80">
//                     <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//                     <input
//                         type="text"
//                         placeholder="Search order #, customer, email..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
//                     />
//                 </form>

//                 <div className="flex items-center gap-2 w-full sm:w-auto">
//                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Status:</span>
//                     <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
//                     >
//                         <option value="">All Orders ({orders.length})</option>
//                         <option value="pending">Pending</option>
//                         <option value="processing">Processing</option>
//                         <option value="shipped">Shipped</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="cancelled">Cancelled</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Orders Table */}
//             <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-xs border-collapse">
//                         <thead>
//                             <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//                                 <th className="py-3.5 px-4">Order #</th>
//                                 <th className="py-3.5 px-4">Customer</th>
//                                 <th className="py-3.5 px-4">Date</th>
//                                 <th className="py-3.5 px-4">Total Amount</th>
//                                 <th className="py-3.5 px-4">Fulfillment Stage</th>
//                                 <th className="py-3.5 px-4 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100 font-medium">
//                             {orders.map((ord) => (
//                                 <tr key={ord.id} className="hover:bg-slate-50/60 transition">
//                                     <td className="py-3.5 px-4 font-mono font-black text-slate-900">
//                                         #{ord.order_number}
//                                     </td>
//                                     <td className="py-3.5 px-4">
//                                         <span className="font-bold text-slate-900 block">{ord.customer_name}</span>
//                                         <span className="text-[11px] text-slate-400">{ord.customer_email}</span>
//                                     </td>
//                                     <td className="py-3.5 px-4 text-slate-500 font-mono">
//                                         {new Date(ord.created_at).toLocaleDateString()}
//                                     </td>
//                                     <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
//                                         ${Number(ord.total_amount).toFixed(2)}
//                                     </td>
//                                     <td className="py-3.5 px-4">
//                                         <select
//                                             value={ord.status}
//                                             onChange={(e) => handleStatusChange(ord.id, e.target.value)}
//                                             className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-0 cursor-pointer ${
//                                                 ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
//                                                 ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
//                                                 ord.status === 'processing' ? 'bg-amber-100 text-amber-800' :
//                                                 ord.status === 'cancelled' ? 'bg-red-100 text-red-800' :
//                                                 'bg-slate-100 text-slate-800'
//                                             }`}
//                                         >
//                                             <option value="pending">Pending</option>
//                                             <option value="processing">Processing</option>
//                                             <option value="shipped">Shipped</option>
//                                             <option value="delivered">Delivered</option>
//                                             <option value="cancelled">Cancelled (Restore Stock)</option>
//                                         </select>
//                                     </td>
//                                     <td className="py-3.5 px-4 text-right">
//                                         <button
//                                             onClick={() => setSelectedOrder(ord)}
//                                             className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition flex items-center gap-1.5 ml-auto"
//                                         >
//                                             <Eye className="w-3.5 h-3.5" /> Inspect
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Inspect Order Modal */}
//             {selectedOrder && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
//                     <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in">
//                         <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
//                             <div>
//                                 <h3 className="text-base font-black text-slate-900">Order #{selectedOrder.order_number}</h3>
//                                 <p className="text-xs text-slate-500">Customer: {selectedOrder.customer_name}</p>
//                             </div>
//                             <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <div className="space-y-4 text-xs">
//                             <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600">
//                                 <p className="flex items-center gap-2">
//                                     <MapPin className="w-3.5 h-3.5 text-slate-400" />
//                                     <span>{selectedOrder.shipping_address}</span>
//                                 </p>
//                                 <p className="flex items-center gap-2">
//                                     <CreditCard className="w-3.5 h-3.5 text-slate-400" />
//                                     <span>Method: {selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
//                                 </p>
//                             </div>

//                             <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] pt-2">
//                                 Reserved Line Items ({selectedOrder.items?.length || 0})
//                             </h4>

//                             <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
//                                 {selectedOrder.items?.map((item) => (
//                                     <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
//                                         <div className="flex items-center gap-2.5">
//                                             <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
//                                             <div>
//                                                 <p className="font-bold text-slate-900">{item.product_name}</p>
//                                                 <span className="font-mono text-slate-400 text-[10px]">
//                                                     Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <span className="font-black text-slate-900">
//                                             ${Number(item.subtotal).toFixed(2)}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-black text-slate-900">
//                                 <span>Total Valuation</span>
//                                 <span className="text-indigo-600">${Number(selectedOrder.total_amount).toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };