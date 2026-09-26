const API_BASE = '/api';

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'API request failed');
        }
        return data;
    } catch (err) {
        console.error(`[API Error] ${endpoint}:`, err.message);
        throw err;
    }
};

export const authAPI = {
    login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => apiRequest('/auth/me')
};

export const productAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/products${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiRequest(`/products/${id}`),
    getCategories: () => apiRequest('/products/categories'),
    create: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' })
};

export const orderAPI = {
    create: (orderData) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => apiRequest('/orders/my-orders'),
    getAllOrders: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/orders${query ? `?${query}` : ''}`);
    },
    updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getById: (id) => apiRequest(`/orders/${id}`)
};

export const inventoryAPI = {
    getOverview: () => apiRequest('/inventory/overview'),
    adjustStock: (data) => apiRequest('/inventory/adjust-stock', { method: 'POST', body: JSON.stringify(data) }),
    getLogs: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/inventory/logs${query ? `?${query}` : ''}`);
    },
    getPurchaseOrders: () => apiRequest('/inventory/purchase-orders'),
    createPurchaseOrder: (data) => apiRequest('/inventory/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
    updatePOStatus: (id, status) => apiRequest(`/inventory/purchase-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const supplierAPI = {
    getAll: () => apiRequest('/suppliers'),
    create: (data) => apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

export const analyticsAPI = {
    getAnalytics: () => apiRequest('/analytics')
};

export const forecastAPI = {
    getHealth: () => apiRequest('/forecast/health'),
    getProductForecast: (productId, days = 14) => apiRequest(`/forecast/product/${productId}?days=${days}`),
    syncAllForecasts: (days = 14) => apiRequest('/forecast/sync', { method: 'POST', body: JSON.stringify({ days }) }),
    getStoredForecasts: (productId = null) => apiRequest(`/forecast/stored${productId ? `/${productId}` : ''}`)
};

