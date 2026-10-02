// import React, { useState, useEffect } from 'react';
// import { inventoryAPI, productAPI } from '../services/api';
// import {
//     ShoppingBag,
//     Plus,
//     Search,
//     SlidersHorizontal,
//     Edit2,
//     Trash2,
//     History,
//     X,
//     Check,
//     AlertTriangle,
//     PackagePlus,
//     TrendingDown,
//     TrendingUp
// } from 'lucide-react';

// export const AdminInventory = () => {
//     const [inventory, setInventory] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [summary, setSummary] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [statusFilter, setStatusFilter] = useState('');
//     const [actionMsg, setActionMsg] = useState('');

//     // Modals
//     const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
//     const [isProductModalOpen, setIsProductModalOpen] = useState(false);
//     const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
//     const [logs, setLogs] = useState([]);
//     const [selectedProduct, setSelectedProduct] = useState(null);

//     // Form states
//     const [adjustForm, setAdjustForm] = useState({
//         productId: '',
//         changeAmount: 10,
//         changeType: 'manual_restock',
//         notes: ''
//     });

//     const [productForm, setProductForm] = useState({
//         sku: '',
//         name: '',
//         description: '',
//         price: '',
//         cost_price: '',
//         category_id: 1,
//         supplier_id: 1,
//         stock_quantity: 20,
//         safety_stock_level: 15,
//         reorder_point: 25,
//         max_stock_capacity: 200,
//         image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
//     });

//     const loadInventoryData = async () => {
//         try {
//             setLoading(true);
//             const [invRes, catRes] = await Promise.all([
//                 inventoryAPI.getOverview(),
//                 productAPI.getCategories()
//             ]);

//             if (invRes.success) {
//                 setInventory(invRes.inventory);
//                 setSummary(invRes.summary);
//             }
//             if (catRes.success) {
//                 setCategories(catRes.categories);
//             }
//         } catch (err) {
//             console.error('Failed to load inventory:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadInventoryData();
//     }, []);

//     const showNotification = (msg) => {
//         setActionMsg(msg);
//         setTimeout(() => setActionMsg(''), 4000);
//     };

//     const handleAdjustStock = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await inventoryAPI.adjustStock(adjustForm);
//             if (res.success) {
//                 showNotification(res.message);
//                 setIsAdjustModalOpen(false);
//                 loadInventoryData();
//             }
//         } catch (err) {
//             alert(err.message || 'Failed to adjust stock');
//         }
//     };

//     const handleCreateProduct = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await productAPI.create(productForm);
//             if (res.success) {
//                 showNotification('Product created and added to inventory.');
//                 setIsProductModalOpen(false);
//                 loadInventoryData();
//             }
//         } catch (err) {
//             alert(err.message || 'Failed to create product');
//         }
//     };

//     const handleDeleteProduct = async (id) => {
//         if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
//         try {
//             const res = await productAPI.delete(id);
//             if (res.success) {
//                 showNotification(res.message);
//                 loadInventoryData();
//             }
//         } catch (err) {
//             alert(err.message || 'Failed to delete product');
//         }
//     };

//     const viewAuditLogs = async (product = null) => {
//         try {
//             setSelectedProduct(product);
//             const res = await inventoryAPI.getLogs(product ? { productId: product.id } : {});
//             if (res.success) {
//                 setLogs(res.logs);
//                 setIsLogsModalOpen(true);
//             }
//         } catch (err) {
//             alert('Failed to load inventory audit logs');
//         }
//     };

//     const filteredInventory = inventory.filter(p => {
//         const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
//         if (!matchesSearch) return false;
//         if (statusFilter === 'out') return p.stock_quantity === 0;
//         if (statusFilter === 'low') return p.stock_quantity > 0 && p.stock_quantity <= p.reorder_point;
//         if (statusFilter === 'healthy') return p.stock_quantity > p.reorder_point;
//         return true;
//     });

//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
//                 <div>
//                     <h1 className="text-3xl font-black text-slate-900 tracking-tight">
//                         Warehouse Stock & Catalog Management
//                     </h1>
//                     <p className="text-xs text-slate-500 mt-1">
//                         Monitor stock levels, execute manual adjustments, and audit inventory transactions
//                     </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={() => {
//                             if (inventory.length > 0) {
//                                 setAdjustForm({ productId: inventory[0].id, changeAmount: 10, changeType: 'manual_restock', notes: '' });
//                             }
//                             setIsAdjustModalOpen(true);
//                         }}
//                         className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
//                     >
//                         <PackagePlus className="w-4 h-4" /> Quick Stock Adjust
//                     </button>
//                     <button
//                         onClick={() => setIsProductModalOpen(true)}
//                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
//                     >
//                         <Plus className="w-4 h-4" /> New Product
//                     </button>
//                     <button
//                         onClick={() => viewAuditLogs(null)}
//                         className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
//                     >
//                         <History className="w-4 h-4" /> Audit Logs
//                     </button>
//                 </div>
//             </div>

//             {actionMsg && (
//                 <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
//                     <Check className="w-4 h-4" /> {actionMsg}
//                 </div>
//             )}

//             {/* Filter Bar */}
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
//                 <div className="relative w-full sm:w-80">
//                     <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//                     <input
//                         type="text"
//                         placeholder="Search SKU, Product..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
//                     />
//                 </div>

//                 <div className="flex items-center gap-2 w-full sm:w-auto">
//                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
//                     <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
//                     >
//                         <option value="">All SKUs ({inventory.length})</option>
//                         <option value="healthy">In Stock & Healthy</option>
//                         <option value="low">Low Stock Alerts</option>
//                         <option value="out">Out of Stock</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Inventory Table */}
//             <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-xs border-collapse">
//                         <thead>
//                             <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//                                 <th className="py-3.5 px-4">Product Info</th>
//                                 <th className="py-3.5 px-4">Category</th>
//                                 <th className="py-3.5 px-4 text-center">Retail Price</th>
//                                 <th className="py-3.5 px-4 text-center">Stock Level</th>
//                                 <th className="py-3.5 px-4 text-center">Reorder Point</th>
//                                 <th className="py-3.5 px-4 text-center">Status</th>
//                                 <th className="py-3.5 px-4 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {filteredInventory.map((item) => {
//                                 const isOut = item.stock_quantity === 0;
//                                 const isLow = !isOut && item.stock_quantity <= item.reorder_point;

//                                 return (
//                                     <tr key={item.id} className="hover:bg-slate-50/60 transition">
//                                         <td className="py-3.5 px-4">
//                                             <div className="flex items-center gap-3">
//                                                 <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
//                                                 <div>
//                                                     <span className="font-bold text-slate-900 block">{item.name}</span>
//                                                     <span className="font-mono text-slate-400 text-[11px]">{item.sku}</span>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="py-3.5 px-4 text-slate-600">
//                                             {item.category_name || 'General'}
//                                         </td>
//                                         <td className="py-3.5 px-4 text-center font-bold text-slate-900">
//                                             ${Number(item.price).toFixed(2)}
//                                         </td>
//                                         <td className="py-3.5 px-4 text-center font-black text-sm">
//                                             {item.stock_quantity}
//                                         </td>
//                                         <td className="py-3.5 px-4 text-center font-mono text-slate-500">
//                                             {item.reorder_point} units
//                                         </td>
//                                         <td className="py-3.5 px-4 text-center">
//                                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
//                                                 isOut ? 'bg-red-100 text-red-800' :
//                                                 isLow ? 'bg-amber-100 text-amber-800' :
//                                                 'bg-emerald-100 text-emerald-800'
//                                             }`}>
//                                                 {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
//                                             </span>
//                                         </td>
//                                         <td className="py-3.5 px-4 text-right">
//                                             <div className="flex items-center justify-end gap-1.5">
//                                                 <button
//                                                     onClick={() => {
//                                                         setAdjustForm({
//                                                             productId: item.id,
//                                                             changeAmount: 10,
//                                                             changeType: 'manual_restock',
//                                                             notes: `Restock adjustment for ${item.name}`
//                                                         });
//                                                         setIsAdjustModalOpen(true);
//                                                     }}
//                                                     className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
//                                                     title="Adjust Stock"
//                                                 >
//                                                     <PackagePlus className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => viewAuditLogs(item)}
//                                                     className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
//                                                     title="View Item History"
//                                                 >
//                                                     <History className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteProduct(item.id)}
//                                                     className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
//                                                     title="Delete Product"
//                                                 >
//                                                     <Trash2 className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Modal 1: Quick Adjust Stock */}
//             {isAdjustModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
//                     <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in">
//                         <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
//                             <h3 className="text-base font-black text-slate-900">Adjust Warehouse Stock</h3>
//                             <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
//                             <div>
//                                 <label className="block font-bold uppercase text-slate-700 mb-1">Target Product</label>
//                                 <select
//                                     value={adjustForm.productId}
//                                     onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
//                                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                 >
//                                     {inventory.map(p => (
//                                         <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Change Delta (+/-)</label>
//                                     <input
//                                         type="number"
//                                         required
//                                         value={adjustForm.changeAmount}
//                                         onChange={(e) => setAdjustForm({ ...adjustForm, changeAmount: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Audit Reason</label>
//                                     <select
//                                         value={adjustForm.changeType}
//                                         onChange={(e) => setAdjustForm({ ...adjustForm, changeType: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                     >
//                                         <option value="manual_restock">Manual Restock (+)</option>
//                                         <option value="adjustment">Stock Count Adjustment</option>
//                                         <option value="supplier_received">Supplier Shipment</option>
//                                         <option value="order_deduction">Manual Deduction (-)</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block font-bold uppercase text-slate-700 mb-1">Internal Note</label>
//                                 <input
//                                     type="text"
//                                     value={adjustForm.notes}
//                                     onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
//                                     placeholder="Warehouse audit reference..."
//                                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                 />
//                             </div>

//                             <button
//                                 type="submit"
//                                 className="w-full mt-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
//                             >
//                                 Apply Stock Mutation & Audit Log
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Modal 2: Add New Product */}
//             {isProductModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
//                     <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
//                         <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
//                             <h3 className="text-base font-black text-slate-900">Add New Catalog Product</h3>
//                             <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">SKU Code</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         placeholder="SKU-TECH-01"
//                                         value={productForm.sku}
//                                         onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Category</label>
//                                     <select
//                                         value={productForm.category_id}
//                                         onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                     >
//                                         {categories.map(c => (
//                                             <option key={c.id} value={c.id}>{c.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block font-bold uppercase text-slate-700 mb-1">Product Title</label>
//                                 <input
//                                     type="text"
//                                     required
//                                     placeholder="Mechanical Keyboard RGB"
//                                     value={productForm.name}
//                                     onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
//                                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block font-bold uppercase text-slate-700 mb-1">Description</label>
//                                 <textarea
//                                     rows={2}
//                                     value={productForm.description}
//                                     onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
//                                     placeholder="Detailed item specification..."
//                                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Retail Price ($)</label>
//                                     <input
//                                         type="number"
//                                         step="0.01"
//                                         required
//                                         value={productForm.price}
//                                         onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Initial Stock Units</label>
//                                     <input
//                                         type="number"
//                                         required
//                                         value={productForm.stock_quantity}
//                                         onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
//                                     />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Safety Stock Level</label>
//                                     <input
//                                         type="number"
//                                         value={productForm.safety_stock_level}
//                                         onChange={(e) => setProductForm({ ...productForm, safety_stock_level: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block font-bold uppercase text-slate-700 mb-1">Reorder Point (ROP)</label>
//                                     <input
//                                         type="number"
//                                         value={productForm.reorder_point}
//                                         onChange={(e) => setProductForm({ ...productForm, reorder_point: e.target.value })}
//                                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
//                                     />
//                                 </div>
//                             </div>

//                             <button
//                                 type="submit"
//                                 className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
//                             >
//                                 Save Product & Integrate Into Stock
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Modal 3: Audit Logs Inspector */}
//             {isLogsModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
//                     <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in max-h-[85vh] flex flex-col">
//                         <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
//                             <div>
//                                 <h3 className="text-base font-black text-slate-900">Inventory Transaction Audit Logs</h3>
//                                 <p className="text-xs text-slate-500">
//                                     {selectedProduct ? `Filtered for ${selectedProduct.name}` : 'All recent stock adjustments'}
//                                 </p>
//                             </div>
//                             <button onClick={() => setIsLogsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <div className="divide-y divide-slate-100 overflow-y-auto flex-1 pr-2 text-xs">
//                             {logs.map((log) => (
//                                 <div key={log.id} className="py-3 flex items-center justify-between gap-4">
//                                     <div>
//                                         <span className="font-bold text-slate-900 block">{log.product_name}</span>
//                                         <span className="text-[11px] text-slate-400 font-mono">
//                                             {log.change_type} • {log.notes || 'Routine update'}
//                                         </span>
//                                     </div>
//                                     <div className="text-right">
//                                         <span className={`font-black ${log.quantity_changed >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                                             {log.quantity_changed >= 0 ? `+${log.quantity_changed}` : log.quantity_changed} units
//                                         </span>
//                                         <span className="text-[11px] text-slate-400 block font-mono">
//                                             Stock: {log.previous_stock} &rarr; {log.new_stock}
//                                         </span>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

import React, { useState, useEffect } from 'react';
import { inventoryAPI, productAPI } from '../services/api';
import {
    Plus,
    Search,
    Trash2,
    History,
    X,
    Check,
    PackagePlus
} from 'lucide-react';

export const AdminInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [adjustForm, setAdjustForm] = useState({
        productId: '',
        changeAmount: 10,
        changeType: 'manual_restock',
        notes: ''
    });

    const [productForm, setProductForm] = useState({
        sku: '',
        name: '',
        description: '',
        price: '',
        cost_price: '',
        category_id: 1,
        supplier_id: 1,
        stock_quantity: 20,
        safety_stock_level: 15,
        reorder_point: 25,
        max_stock_capacity: 200,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    });

    const formatINR = (val) => {
        return '₹' + Number(val || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const loadInventoryData = async () => {
        try {
            setLoading(true);
            const [invRes, catRes] = await Promise.all([
                inventoryAPI.getOverview(),
                productAPI.getCategories()
            ]);

            if (invRes.success) setInventory(invRes.inventory);
            if (catRes.success) setCategories(catRes.categories);
        } catch (err) {
            console.error('Failed to load inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventoryData();
    }, []);

    const showNotification = (msg) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(''), 4000);
    };

    const handleAdjustStock = async (e) => {
        e.preventDefault();
        try {
            const res = await inventoryAPI.adjustStock(adjustForm);
            if (res.success) {
                showNotification(res.message);
                setIsAdjustModalOpen(false);
                loadInventoryData();
            }
        } catch (err) {
            alert(err.message || 'Failed to adjust stock');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await productAPI.create(productForm);
            if (res.success) {
                showNotification('Product created and added to inventory.');
                setIsProductModalOpen(false);
                loadInventoryData();
            }
        } catch (err) {
            alert(err.message || 'Failed to create product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
        try {
            const res = await productAPI.delete(id);
            if (res.success) {
                showNotification(res.message);
                loadInventoryData();
            }
        } catch (err) {
            alert(err.message || 'Failed to delete product');
        }
    };

    const viewAuditLogs = async (product = null) => {
        try {
            setSelectedProduct(product);
            const res = await inventoryAPI.getLogs(product ? { productId: product.id } : {});
            if (res.success) {
                setLogs(res.logs);
                setIsLogsModalOpen(true);
            }
        } catch (err) {
            alert('Failed to load inventory audit logs');
        }
    };

    const filteredInventory = inventory.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (statusFilter === 'out') return p.stock_quantity === 0;
        if (statusFilter === 'low') return p.stock_quantity > 0 && p.stock_quantity <= p.reorder_point;
        if (statusFilter === 'healthy') return p.stock_quantity > p.reorder_point;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Warehouse Stock &amp; Catalog Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Monitor stock levels, execute manual adjustments, and audit inventory transactions
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (inventory.length > 0) {
                                setAdjustForm({ productId: inventory[0].id, changeAmount: 10, changeType: 'manual_restock', notes: '' });
                            }
                            setIsAdjustModalOpen(true);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
                    >
                        <PackagePlus className="w-4 h-4" /> Quick Stock Adjust
                    </button>
                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
                    >
                        <Plus className="w-4 h-4" /> New Product
                    </button>
                    <button
                        onClick={() => viewAuditLogs(null)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                    >
                        <History className="w-4 h-4" /> Audit Logs
                    </button>
                </div>
            </div>

            {actionMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {actionMsg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search SKU, Product..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                        <option value="">All SKUs ({inventory.length})</option>
                        <option value="healthy">In Stock &amp; Healthy</option>
                        <option value="low">Low Stock Alerts</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Product Info</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4 text-center">Retail Price</th>
                                <th className="py-3.5 px-4 text-center">Stock Level</th>
                                <th className="py-3.5 px-4 text-center">Reorder Point</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.map((item) => {
                                const isOut = item.stock_quantity === 0;
                                const isLow = !isOut && item.stock_quantity <= item.reorder_point;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{item.name}</span>
                                                    <span className="font-mono text-slate-400 text-[11px]">{item.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            {item.category_name || 'General'}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                            {formatINR(item.price)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-black text-sm">
                                            {item.stock_quantity}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                                            {item.reorder_point} units
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                isOut ? 'bg-red-100 text-red-800' :
                                                isLow ? 'bg-amber-100 text-amber-800' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setAdjustForm({
                                                            productId: item.id,
                                                            changeAmount: 10,
                                                            changeType: 'manual_restock',
                                                            notes: `Restock adjustment for ${item.name}`
                                                        });
                                                        setIsAdjustModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Adjust Stock"
                                                >
                                                    <PackagePlus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => viewAuditLogs(item)}
                                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                                                    title="View Item History"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Adjust Modal */}
            {isAdjustModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-base font-black text-slate-900">Adjust Warehouse Stock</h3>
                            <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Target Product</label>
                                <select
                                    value={adjustForm.productId}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    {inventory.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Change Delta (+/-)</label>
                                    <input
                                        type="number"
                                        required
                                        value={adjustForm.changeAmount}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, changeAmount: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Audit Reason</label>
                                    <select
                                        value={adjustForm.changeType}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, changeType: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    >
                                        <option value="manual_restock">Manual Restock (+)</option>
                                        <option value="adjustment">Stock Count Adjustment</option>
                                        <option value="supplier_received">Supplier Shipment</option>
                                        <option value="order_deduction">Manual Deduction (-)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Internal Note</label>
                                <input
                                    type="text"
                                    value={adjustForm.notes}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                    placeholder="Warehouse audit reference..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
                            >
                                Apply Stock Mutation &amp; Audit Log
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-base font-black text-slate-900">Add New Catalog Product</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">SKU Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="SKU-TECH-01"
                                        value={productForm.sku}
                                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Category</label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Product Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Mechanical Keyboard RGB"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    placeholder="Detailed item specification..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Retail Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Initial Stock Units</label>
                                    <input
                                        type="number"
                                        required
                                        value={productForm.stock_quantity}
                                        onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Safety Stock Level</label>
                                    <input
                                        type="number"
                                        value={productForm.safety_stock_level}
                                        onChange={(e) => setProductForm({ ...productForm, safety_stock_level: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-slate-700 mb-1">Reorder Point (ROP)</label>
                                    <input
                                        type="number"
                                        value={productForm.reorder_point}
                                        onChange={(e) => setProductForm({ ...productForm, reorder_point: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                            >
                                Save Product &amp; Integrate Into Stock
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Audit Logs Inspector Modal */}
            {isLogsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Inventory Transaction Audit Logs</h3>
                                <p className="text-xs text-slate-500">
                                    {selectedProduct ? `Filtered for ${selectedProduct.name}` : 'All recent stock adjustments'}
                                </p>
                            </div>
                            <button onClick={() => setIsLogsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100 overflow-y-auto flex-1 pr-2 text-xs">
                            {logs.map((log) => (
                                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                                    <div>
                                        <span className="font-bold text-slate-900 block">{log.product_name}</span>
                                        <span className="text-[11px] text-slate-400 font-mono">
                                            {log.change_type} &bull; {log.notes || 'Routine update'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-black ${log.quantity_changed >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {log.quantity_changed >= 0 ? `+${log.quantity_changed}` : log.quantity_changed} units
                                        </span>
                                        <span className="text-[11px] text-slate-400 block font-mono">
                                            Stock: {log.previous_stock} &rarr; {log.new_stock}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};