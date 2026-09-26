const { getInventoryAnalytics } = require('../services/analyticsEngine');

const getAnalytics = async (req, res) => {
    try {
        const analytics = await getInventoryAnalytics();
        return res.json({
            success: true,
            data: analytics,
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error('Analytics controller error:', err);
        return res.status(500).json({ success: false, message: 'Failed to generate inventory analytics.' });
    }
};

module.exports = {
    getAnalytics
};
