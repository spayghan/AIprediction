import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, ShoppingBag, Database, Sparkles } from 'lucide-react';

export const AdminLogin = ({ setView }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@ecommerce.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password, 'admin');
            setView('admin-dashboard');
        } catch (err) {
            setError(err.message || 'Admin authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = () => {
        setEmail('admin@ecommerce.com');
        setPassword('admin123');
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl my-6">
            <div className="max-w-md w-full">
                
                {/* Enterprise Card */}
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/30">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                            Admin Operations Hub
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Admin Portal Sign In</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Restricted to authorized personnel managing Inventory, Suppliers & Order Fulfillment
                        </p>
                    </div>

                    {/* Pre-fill Quick Test Box */}
                    <div className="mb-6 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Default Admin Account
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">admin@ecommerce.com | admin123</p>
                        </div>
                        <button
                            type="button"
                            onClick={fillDemo}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
                        >
                            Auto Fill
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Enterprise Email
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@ecommerce.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Master Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Validating Admin Token...' : 'Enter Admin Control Room'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Features list reminder */}
                    <div className="mt-8 pt-6 border-t border-slate-700/80 space-y-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>AI/DS Demand Forecasting & Dynamic Safety Stock</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Full Inventory Control: Restock, SKU management, POs</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <Database className="w-3.5 h-3.5 text-blue-400" />
                            <span>MySQL Relational Audit Trail for all Stock Operations</span>
                        </div>
                    </div>

                    {/* Switch to customer */}
                    <div className="mt-6 pt-4 border-t border-slate-700/80 text-center">
                        <button
                            onClick={() => setView('customer-login')}
                            className="text-xs font-semibold text-slate-400 hover:text-white transition"
                        >
                            Are you a Customer Shopper? Switch to Customer Login
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};
