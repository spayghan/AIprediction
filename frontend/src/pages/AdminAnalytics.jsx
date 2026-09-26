import React, { useState, useEffect } from 'react';
import { analyticsAPI, inventoryAPI } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
    Brain, 
    TrendingUp, 
    AlertTriangle, 
    ShieldCheck, 
    Sparkles, 
    RefreshCw, 
    Package, 
    Clock, 
    CheckCircle2, 
    Send,
    Layers,
    DollarSign
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [poSuccessMsg, setPoSuccessMsg] = useState('');

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const res = await analyticsAPI.getAnalytics();
            if (res.success) {
                setAnalytics(res.data);
            }
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const handleCreatePOFromAI = async (product) => {
        try {
            const res = await inventoryAPI.createPurchaseOrder({
                supplierId: product.supplier_id || 1,
                productId: product.id,
                quantity: product.recommendedRestock || 30,
                expectedDeliveryDays: product.lead_time_days || 5
            });

            if (res.success) {
                setPoSuccessMsg(`Auto-PO for ${product.name} (${product.recommendedRestock} units) dispatched to supplier!`);
                setTimeout(() => setPoSuccessMsg(''), 4000);
                loadAnalytics();
            }
        } catch (err) {
            alert(err.message || 'Failed to dispatch purchase order');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-base font-bold text-slate-900">Running AI Demand Forecast Models...</h3>
                <p className="text-xs text-slate-400 mt-1">Calculating moving averages, standard deviation, and dynamic safety buffers</p>
            </div>
        );
    }

    if (!analytics) return null;

    const { summary, products, categoryDistribution, forwardForecastSeries } = analytics;

    // Line Chart Data: 7-Day Forward Demand Projections
    const lineChartData = {
        labels: forwardForecastSeries.days,
        datasets: forwardForecastSeries.products.map((item, idx) => {
            const colors = [
                { border: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
                { border: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
                { border: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
                { border: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
                { border: '#9333ea', bg: 'rgba(147, 51, 234, 0.1)' }
            ];
            const color = colors[idx % colors.length];
            return {
                label: item.sku,
                data: item.data,
                borderColor: color.border,
                backgroundColor: color.bg,
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            };
        })
    };

    // Doughnut Chart Data: Warehouse Inventory Distribution by Category
    const categoryLabels = Object.keys(categoryDistribution);
    const categoryValues = Object.values(categoryDistribution);
    const doughnutData = {
        labels: categoryLabels,
        datasets: [{
            data: categoryValues,
            backgroundColor: [
                '#6366f1',
                '#10b981',
                '#f59e0b',
                '#ec4899',
                '#3b82f6',
                '#8b5cf6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    // ABC Pareto counts
    const countA = products.filter(p => p.abcCategory === 'A').length;
    const countB = products.filter(p => p.abcCategory === 'B').length;
    const countC = products.filter(p => p.abcCategory === 'C').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            AI / DS Integration
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                            Module: Inventory Analytics & Predictive Forecasting
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Predictive Inventory Analytics Hub
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Machine Learning heuristics for demand forecasting, dynamic safety stock, and automated supplier replenishment
                    </p>
                </div>

                <button
                    onClick={loadAnalytics}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs self-start sm:self-auto"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Recompute Forecasts
                </button>
            </div>

            {poSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{poSuccessMsg}</span>
                </div>
            )}

            {/* AI Health Score & Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Health Score */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Inventory Health Index
                            </span>
                            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                                <Sparkles className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black tracking-tight text-white">
                                {summary.healthScore}
                            </span>
                            <span className="text-sm font-bold text-slate-400">/ 100</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mt-2">
                            Status: {summary.healthStatus}
                        </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Critical Stockout Risks:</span>
                            <span className="font-bold text-red-400">{summary.criticalStockoutsCount} SKUs</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Low Stock SKUs:</span>
                            <span className="font-bold text-amber-400">{summary.lowStockCount} SKUs</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Optimal Stocked SKUs:</span>
                            <span className="font-bold text-emerald-400">{summary.healthyStockCount} SKUs</span>
                        </div>
                    </div>
                </div>

                {/* ABC Pareto Distribution */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                ABC Pareto Stratification
                            </span>
                            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Layers className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            Classification based on 80/20 cumulative revenue velocity and warehouse holding value.
                        </p>
                        
                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                                <div>
                                    <span className="font-black text-indigo-900">Class A (High Value)</span>
                                    <p className="text-[11px] text-indigo-700">Drives ~75% of revenue</p>
                                </div>
                                <span className="text-base font-black text-indigo-900">{countA} SKUs</span>
                            </div>

                            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                                <div>
                                    <span className="font-black text-blue-900">Class B (Moderate)</span>
                                    <p className="text-[11px] text-blue-700">Drives ~20% of revenue</p>
                                </div>
                                <span className="text-base font-black text-blue-900">{countB} SKUs</span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div>
                                    <span className="font-black text-slate-800">Class C (Low / Bulk)</span>
                                    <p className="text-[11px] text-slate-500">Drives ~5% of revenue</p>
                                </div>
                                <span className="text-base font-black text-slate-800">{countC} SKUs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demand Forecast Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Aggregate Demand Horizon
                            </span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <TrendingUp className="w-4 h-4" />
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mb-6">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">7-Day</span>
                                <span className="text-lg font-black text-slate-900">
                                    {products.reduce((acc, p) => acc + p.forecast7Days, 0)}
                                </span>
                                <span className="text-[10px] text-slate-500 block">units</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">14-Day</span>
                                <span className="text-lg font-black text-slate-900">
                                    {products.reduce((acc, p) => acc + p.forecast14Days, 0)}
                                </span>
                                <span className="text-[10px] text-slate-500 block">units</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">30-Day</span>
                                <span className="text-lg font-black text-slate-900">
                                    {products.reduce((acc, p) => acc + p.forecast30Days, 0)}
                                </span>
                                <span className="text-[10px] text-slate-500 block">units</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Projections use Holt-Winters linear trend smoothing on recent order checkouts with lead-time buffering.
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Confidence Interval:</span>
                        <span className="font-bold text-emerald-600">95% (Z = 1.65)</span>
                    </div>
                </div>

            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 7-Day Demand Forecast Chart */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">7-Day Forward Demand Trajectory (Top Velocity SKUs)</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Projected daily outbound order demand based on moving average model</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <Line
                            data={lineChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { font: { size: 11 }, boxWidth: 12 }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { precision: 0 }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Category Inventory Stock Distribution */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Category Stock Allocation</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Physical units share across product categories</p>
                    </div>
                    <div className="h-64 my-auto">
                        <Doughnut
                            data={doughnutData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { font: { size: 10 }, boxWidth: 10 }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

            </div>

            {/* AI Automated Restock Recommendations Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                                <Brain className="w-4 h-4" />
                            </span>
                            <h3 className="text-base font-black text-slate-900">
                                AI Stockout Risk Matrix & Dynamic Reorder Engine
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Evaluates Days of Supply Runway against Supplier Lead Times to recommend optimal reorder quantities
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3 px-4">SKU / Product</th>
                                <th className="py-3 px-4">Current Stock</th>
                                <th className="py-3 px-4">Avg Daily Demand</th>
                                <th className="py-3 px-4">Runway (Days)</th>
                                <th className="py-3 px-4">Dynamic Safety Buffer</th>
                                <th className="py-3 px-4">Dynamic ROP</th>
                                <th className="py-3 px-4">ABC Class</th>
                                <th className="py-3 px-4">Risk State</th>
                                <th className="py-3 px-4 text-right">AI Recommended Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                                    <td className="py-3 px-4">
                                        <span className="font-bold text-slate-900 block">{p.name}</span>
                                        <span className="font-mono text-slate-400 text-[11px]">{p.sku}</span>
                                    </td>

                                    <td className="py-3 px-4 font-black text-slate-800 text-sm">
                                        {p.stock_quantity}
                                    </td>

                                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                                        {p.avgDailyDemand} units/day
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className={`font-black ${p.daysOfSupply <= p.lead_time_days ? 'text-red-600' : p.daysOfSupply <= p.lead_time_days * 2 ? 'text-amber-600' : 'text-slate-700'}`}>
                                            {p.daysOfSupply} days
                                        </span>
                                    </td>

                                    <td className="py-3 px-4 font-mono text-slate-700">
                                        {p.dynamicSafetyStock} units
                                    </td>

                                    <td className="py-3 px-4 font-mono text-slate-700">
                                        {p.dynamicROP} units
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                            p.abcCategory === 'A' ? 'bg-indigo-100 text-indigo-800' :
                                            p.abcCategory === 'B' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            Class {p.abcCategory}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            p.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 animate-pulse' :
                                            p.riskLevel === 'LOW STOCK' ? 'bg-amber-100 text-amber-800' :
                                            p.riskLevel === 'OVERSTOCKED' ? 'bg-purple-100 text-purple-800' :
                                            'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {p.riskLevel}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                        {p.recommendedRestock > 0 ? (
                                            <button
                                                onClick={() => handleCreatePOFromAI(p)}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center gap-1.5 ml-auto shadow-xs"
                                                title={`Issue PO for ${p.recommendedRestock} units to ${p.supplier_name}`}
                                            >
                                                <Send className="w-3 h-3" />
                                                Order +{p.recommendedRestock} Units
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 font-medium">Stock Healthy</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
