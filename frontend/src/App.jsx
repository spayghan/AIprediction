import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Customer Pages
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CustomerOrders } from './pages/CustomerOrders';
import { CustomerLogin } from './pages/CustomerLogin';
import { CustomerRegister } from './pages/CustomerRegister';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminInventory } from './pages/AdminInventory';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminOrders } from './pages/AdminOrders';
import { AdminSuppliers } from './pages/AdminSuppliers';

const MainLayout = () => {
    const { user, isAdmin, isAuthenticated } = useAuth();
    const [currentView, setView] = useState('shop');

    const renderCurrentView = () => {
        // Protected Admin routes check
        const adminViews = ['admin-dashboard', 'admin-inventory', 'admin-analytics', 'admin-orders', 'admin-suppliers'];
        if (adminViews.includes(currentView) && !isAdmin) {
            return <AdminLogin setView={setView} />;
        }

        // Protected Customer routes check
        if ((currentView === 'customer-orders' || currentView === 'checkout') && !isAuthenticated) {
            return <CustomerLogin setView={setView} />;
        }

        switch (currentView) {
            // Customer Views
            case 'shop':
                return <Shop setView={setView} />;
            case 'cart':
                return <Cart setView={setView} />;
            case 'checkout':
                return <Checkout setView={setView} />;
            case 'customer-orders':
                return <CustomerOrders setView={setView} />;
            case 'customer-login':
                return <CustomerLogin setView={setView} />;
            case 'customer-register':
                return <CustomerRegister setView={setView} />;

            // Admin Views
            case 'admin-login':
                return <AdminLogin setView={setView} />;
            case 'admin-dashboard':
                return <AdminDashboard setView={setView} />;
            case 'admin-inventory':
                return <AdminInventory setView={setView} />;
            case 'admin-analytics':
                return <AdminAnalytics setView={setView} />;
            case 'admin-orders':
                return <AdminOrders setView={setView} />;
            case 'admin-suppliers':
                return <AdminSuppliers setView={setView} />;

            default:
                return <Shop setView={setView} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Navbar currentView={currentView} setView={setView} />
            <main className="flex-1">
                {renderCurrentView()}
            </main>
            <Footer />
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <MainLayout />
            </CartProvider>
        </AuthProvider>
    );
}
