import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';

export const CustomerRegister = ({ setView }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            setView('shop');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-8 sm:p-10">
                    
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100">
                            <User className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Customer Account</h2>
                        <p className="text-xs text-slate-500 mt-1">Join NexStore to buy products with live inventory tracking</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Jane Doe"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="jane@example.com"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1-555-0123"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Shipping Address
                            </label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Market St, City, State, ZIP"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Registering...' : 'Complete Registration'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500">
                            Already registered?{' '}
                            <button
                                onClick={() => setView('customer-login')}
                                className="font-bold text-indigo-600 hover:underline"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};
