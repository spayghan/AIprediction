import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';

export const LandingPage = ({ setView }) => {
    return (
        <div className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4 py-16 bg-white">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    AI-Powered Inventory Analytics
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none max-w-3xl mx-auto">
                    Smart Inventory &amp; Order Management for Modern E-Commerce
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                    Track products, manage orders, and forecast demand with intelligent analytics. Built for both customers and administrators.
                </p>

                {/* Call to Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                        onClick={() => setView('shop')}
                        className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition"
                    >
                        Start Shopping <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setView('customer-login')}
                        className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm transition shadow-xs"
                    >
                        Customer Login
                    </button>
                </div>

            </div>
        </div>
    );
};