import React, { useState, useEffect } from 'react';
import { supplierAPI, inventoryAPI, productAPI } from '../services/api';
import { 
    Truck, 
    Plus, 
    Check, 
    Clock, 
    Star, 
    Mail, 
    Phone, 
    MapPin, 
    PackageCheck, 
    X, 
    RefreshCw,
    Send
} from 'lucide-react';

export const AdminSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'suppliers'
    const [actionMsg, setActionMsg] = useState('');

    // Modal states
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

    const [newPO, setNewPO] = useState({
        supplierId: '1',
        productId: '1',
        quantity: 50,
        expectedDeliveryDays: 5
    });

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contact_email: '',
        phone: '',
        lead_time_days: 5,
        reliability_score: 4.8,
        address: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [supRes, poRes, prodRes] = await Promise.all([
                supplierAPI.getAll(),
                inventoryAPI.getPurchaseOrders(),
                productAPI.getAll()
            ]);

            if (supRes.success) setSuppliers(supRes.suppliers);
            if (poRes.success) setPurchaseOrders(poRes.orders);
            if (prodRes.success) setProducts(prodRes.products);
        } catch (err) {
            console.error('Failed to load supplier/PO data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const showNotification = (msg) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(''), 4000);
    };

    const handleCreatePO = async (e) => {
        e.preventDefault();
        try {
            const res = await inventoryAPI.createPurchaseOrder(newPO);
            if (res.success) {
                showNotification(res.message);
                setIsPOModalOpen(false);
                loadData();
            }
        } catch (err) {
            alert(err.message || 'Failed to dispatch purchase order');
        }
    };

    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        try {
            const res = await supplierAPI.create(newSupplier);
            if (res.success) {
                showNotification(`Supplier "${newSupplier.name}" added to procurement network.`);
                setIsSupplierModalOpen(false);
                setNewSupplier({
                    name: '',
                    contact_email: '',
                    phone: '',
                    lead_time_days: 5,
                    reliability_score: 4.8,
                    address: ''
                });
                loadData();
            }
        } catch (err) {
            alert(err.message || 'Failed to register supplier');
        }
    };

    const handleReceivePO = async (poId) => {
        try {
            const res = await inventoryAPI.updatePOStatus(poId, 'received');
            if (res.success) {
                showNotification(res.message);
                loadData();
            }
        } catch (err) {
            alert(err.message || 'Failed to receive purchase order');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Suppliers & Replenishment Orders
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage vendor network, lead times, and track automated inbound purchase orders
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPOModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                    >
                        <Plus className="w-4 h-4" /> Issue Purchase Order
                    </button>
                    <button
                        onClick={() => setIsSupplierModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                    >
                        <Truck className="w-4 h-4" /> Add Vendor
                    </button>
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {actionMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('pos')}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
                        activeTab === 'pos'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Send className="w-4 h-4" /> Inbound Purchase Orders ({purchaseOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
                        activeTab === 'suppliers'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Truck className="w-4 h-4" /> Approved Suppliers ({suppliers.length})
                </button>
            </div>

            {/* Tab 1: Inbound Purchase Orders */}
            {activeTab === 'pos' && (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">PO Number</th>
                                    <th className="py-3.5 px-4">Supplier</th>
                                    <th className="py-3.5 px-4">Target Product / SKU</th>
                                    <th className="py-3.5 px-4">Order Quantity</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Expected Delivery</th>
                                    <th className="py-3.5 px-4 text-right">Warehouse Intake</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchaseOrders.map((po) => {
                                    const isReceived = po.status === 'received';
                                    return (
                                        <tr key={po.id} className="hover:bg-slate-50/60 transition">
                                            <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                                                {po.po_number}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-900 block">{po.supplier_name}</span>
                                                <span className="text-[11px] text-slate-400">{po.supplier_email}</span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-900 block">{po.product_name}</span>
                                                <span className="font-mono text-slate-400 text-[11px]">{po.sku}</span>
                                            </td>

                                            <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                                                +{po.quantity} units
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    po.status === 'received' ? 'bg-emerald-100 text-emerald-800' :
                                                    po.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {po.status}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-slate-600 font-mono">
                                                {po.expected_delivery_date || 'In 4 days'}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                {!isReceived ? (
                                                    <button
                                                        onClick={() => handleReceivePO(po.id)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <PackageCheck className="w-3.5 h-3.5" /> Receive & Restock
                                                    </button>
                                                ) : (
                                                    <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                                                        <Check className="w-3.5 h-3.5" /> Stock Restocked
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Suppliers Directory */}
            {activeTab === 'suppliers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((s) => (
                        <div key={s.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                                    <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        {Number(s.reliability_score).toFixed(2)}
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-slate-600">
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{s.contact_email}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{s.phone || 'N/A'}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{s.address || 'Global Hub'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Lead Time</span>
                                    <span className="font-black text-slate-900">{s.lead_time_days} days</span>
                                </div>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
                                    {s.supplied_products_count || 0} Catalog SKUs
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create PO Modal */}
            {isPOModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-black text-slate-900">Issue Purchase Order</h3>
                            <button onClick={() => setIsPOModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Select Supplier</label>
                                <select
                                    value={newPO.supplierId}
                                    onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                >
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.lead_time_days}d lead time)</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Product to Replenish</label>
                                <select
                                    value={newPO.productId}
                                    onChange={(e) => setNewPO({ ...newPO, productId: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Current: {p.stock_quantity}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Order Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newPO.quantity}
                                        onChange={(e) => setNewPO({ ...newPO, quantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Delivery Window (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newPO.expectedDeliveryDays}
                                        onChange={(e) => setNewPO({ ...newPO, expectedDeliveryDays: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                            >
                                Dispatch Purchase Order to Vendor
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Supplier Modal */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-black text-slate-900">Register New Supplier</h3>
                            <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Company / Supplier Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newSupplier.name}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    placeholder="e.g. Apex Global Silicon Ltd"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">B2B Procurement Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newSupplier.contact_email}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, contact_email: e.target.value })}
                                    placeholder="orders@apexsilicon.com"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Lead Time (Days)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newSupplier.lead_time_days}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, lead_time_days: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Reliability (1-5)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newSupplier.reliability_score}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, reliability_score: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Address / Warehouse Hub</label>
                                <input
                                    type="text"
                                    value={newSupplier.address}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                    placeholder="City, State, Country"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
                            >
                                Register Supplier
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
