import React from 'react';
import { Database, Brain, ShoppingBag, ShieldCheck } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-white" />
                            </span>
                            NexStore E-Commerce
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            End-to-end Enterprise Inventory & Order Management System with real-time stock replenishment and demand forecasting.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> Corporate Relevance
                        </h4>
                        <ul className="text-xs space-y-1.5 text-slate-300">
                            <li>• E-Commerce Retail Storefront</li>
                            <li>• Real-Time Cart & Checkout</li>
                            <li>• Multi-Status Order Tracking</li>
                            <li>• Automated Stock Deduction & Return Restock</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-emerald-400" /> AI / DS Integration
                        </h4>
                        <ul className="text-xs space-y-1.5 text-slate-300">
                            <li>• Inventory Analytics & Health Scoring</li>
                            <li>• 7/14/30-Day Moving Average Demand Forecast</li>
                            <li>• Dynamic Safety Stock & Reorder Points (ROP)</li>
                            <li>• ABC Pareto Revenue Classification</li>
                            <li>• Stockout Runway (Days of Supply) Matrix</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-blue-400" /> Architecture & Database
                        </h4>
                        <ul className="text-xs space-y-1.5 text-slate-300">
                            <li>• Frontend: React 19 + Tailwind CSS + Chart.js</li>
                            <li>• Backend: Node.js + Express REST APIs</li>
                            <li>• Primary Database: MySQL 8.0 (schema & seeds)</li>
                            <li>• Dual Login Portals (Customer & Admin)</li>
                        </ul>
                    </div>

                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <p>© 2026 NexStore Logistics & E-Commerce Platform. Complete Working System.</p>
                    <div className="flex items-center gap-4 text-slate-400 font-medium">
                        <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Backend Active
                        </span>
                        <span>MySQL Schema Compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
