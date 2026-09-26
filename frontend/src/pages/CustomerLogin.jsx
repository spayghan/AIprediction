// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

// export const CustomerLogin = ({ setView }) => {
//     const { login } = useAuth();
//     const [email, setEmail] = useState('customer@ecommerce.com');
//     const [password, setPassword] = useState('customer123');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         try {
//             await login(email, password, 'customer');
//             setView('shop');
//         } catch (err) {
//             setError(err.message || 'Login failed. Please check credentials.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fillDemo = () => {
//         setEmail('customer@ecommerce.com');
//         setPassword('customer123');
//     };

//     return (
//         <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
//             <div className="max-w-md w-full">
                
//                 {/* Card */}
//                 <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-8 sm:p-10">
                    
//                     {/* Header */}
//                     <div className="text-center mb-8">
//                         <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100">
//                             <ShoppingBag className="w-7 h-7" />
//                         </div>
//                         <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Portal</h2>
//                         <p className="text-sm text-slate-500 mt-1.5">Sign in to browse inventory, checkout orders & track shipments</p>
//                     </div>

//                     {/* Demo Banner */}
//                     <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-100 flex items-center justify-between">
//                         <div>
//                             <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
//                                 <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demo Customer Account
//                             </p>
//                             <p className="text-[11px] text-slate-600 mt-0.5">customer@ecommerce.com | customer123</p>
//                         </div>
//                         <button
//                             type="button"
//                             onClick={fillDemo}
//                             className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
//                         >
//                             Auto Fill
//                         </button>
//                     </div>

//                     {error && (
//                         <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
//                             {error}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div>
//                             <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
//                                 Email Address
//                             </label>
//                             <div className="relative">
//                                 <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
//                                 <input
//                                     type="email"
//                                     required
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     placeholder="your@email.com"
//                                     className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
//                                 Password
//                             </label>
//                             <div className="relative">
//                                 <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
//                                 <input
//                                     type="password"
//                                     required
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     placeholder="••••••••"
//                                     className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
//                                 />
//                             </div>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
//                         >
//                             {loading ? 'Authenticating...' : 'Sign In as Customer'}
//                             <ArrowRight className="w-4 h-4" />
//                         </button>
//                     </form>

//                     {/* Switch / Register Footer */}
//                     <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
//                         <p className="text-xs text-slate-500">
//                             Don't have an account yet?{' '}
//                             <button
//                                 onClick={() => setView('customer-register')}
//                                 className="font-bold text-indigo-600 hover:underline"
//                             >
//                                 Register here
//                             </button>
//                         </p>

//                         <div className="w-full pt-3 border-t border-dashed border-slate-200">
//                             <button
//                                 onClick={() => setView('admin-login')}
//                                 className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1.5 mx-auto"
//                             >
//                                 <ShieldCheck className="w-4 h-4 text-indigo-500" />
//                                 Are you an Inventory Admin? Switch to Admin Login
//                             </button>
//                         </div>
//                     </div>

//                 </div>

//             </div>
//         </div>
//     );
// };
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CustomerLogin = ({ setView }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('customer@ecommerce.com');
    const [password, setPassword] = useState('customer123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password, 'customer');
            // ✅ Redirect directly to the Customer Orders portal
            setView('customer-orders');
        } catch (err) {
            setError(err.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = () => {
        setEmail('customer@ecommerce.com');
        setPassword('customer123');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                
                {/* Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 mb-4 border border-teal-100">
                            <ShoppingBag className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Portal</h2>
                        <p className="text-sm text-slate-500 mt-1.5">Sign in to track your order shipments and account history</p>
                    </div>

                    {/* Demo Banner */}
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 to-sky-50/80 border border-teal-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Demo Customer Account
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">customer@ecommerce.com | customer123</p>
                        </div>
                        <button
                            type="button"
                            onClick={fillDemo}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition"
                        >
                            Auto Fill
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In to My Orders'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Switch / Register Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
                        <p className="text-xs text-slate-500">
                            Don't have an account yet?{' '}
                            <button
                                onClick={() => setView('customer-register')}
                                className="font-bold text-teal-700 hover:underline"
                            >
                                Register here
                            </button>
                        </p>

                        <div className="w-full pt-3 border-t border-dashed border-slate-200">
                            <button
                                onClick={() => setView('admin-login')}
                                className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center justify-center gap-1.5 mx-auto"
                            >
                                <ShieldCheck className="w-4 h-4 text-teal-600" />
                                Are you an Inventory Admin? Switch to Admin Login
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};