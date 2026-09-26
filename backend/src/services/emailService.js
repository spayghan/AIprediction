const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

/**
 * Sends an urgent Out of Stock alert to Admin
 */
const sendOutOfStockAlert = async ({ product, triggerReason = 'Customer order fulfillment' }) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';

    const subject = `🚨 URGENT: Product Out of Stock - ${product.name} (${product.sku})`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                
                <!-- Header -->
                <div style="background-color: #ef4444; color: #ffffff; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; font-size: 20px;">⚠️ Stockout Alert: Immediate Restock Required</h2>
                    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">StockFlow Inventory & Order Management System</p>
                </div>

                <!-- Body -->
                <div style="padding: 24px;">
                    <p style="font-size: 14px; margin-top: 0;">
                        Hello Admin,
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #334155;">
                        The following item has reached <strong>0 units</strong> in your warehouse inventory and is now marked as <strong>Out of Stock</strong>.
                    </p>

                    <!-- Product Card Info -->
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
                        <tr>
                            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; width: 40%;">Product Name:</td>
                            <td style="padding: 10px 14px; font-weight: bold; color: #0f172a;">${product.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">SKU Code:</td>
                            <td style="padding: 10px 14px; font-family: monospace; font-weight: bold; color: #2563eb;">${product.sku}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Retail Price:</td>
                            <td style="padding: 10px 14px; font-weight: bold; color: #0f172a;">₹${Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Current Stock:</td>
                            <td style="padding: 10px 14px; font-weight: bold; color: #ef4444; font-size: 15px;">0 Units</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Reorder Point (ROP):</td>
                            <td style="padding: 10px 14px; font-weight: bold; color: #0f172a;">${product.reorder_point || 25} Units</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Trigger Reason:</td>
                            <td style="padding: 10px 14px; color: #334155;">${triggerReason}</td>
                        </tr>
                    </table>

                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #991b1b;">
                        <strong>Action Recommended:</strong> Issue a purchase replenishment order (PO) to your vendor via the <em>Suppliers & Replenishment</em> portal to prevent prolonged revenue loss.
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 24px 0 0;">
                        Automated AI/DS Inventory Alert &bull; Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                </div>
            </div>
        </div>
    `;

    // If SMTP credentials aren't configured yet, log a mock email alert in the terminal
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log(`\n================================================================`);
        console.log(`📧 [MOCK EMAIL ALERT] Out of Stock Alert Dispatched`);
        console.log(`To      : ${adminEmail}`);
        console.log(`Subject : ${subject}`);
        console.log(`Product : ${product.name} (SKU: ${product.sku}) has reached 0 units!`);
        console.log(`Reason  : ${triggerReason}`);
        console.log(`Note    : Configure real SMTP credentials in backend/.env to send real emails.`);
        console.log(`================================================================\n`);
        return true;
    }

    try {
        await transporter.sendMail({
            from: `"StockFlow Inventory" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject,
            html: htmlContent
        });
        console.log(`[Email Alert] Out-of-stock notification sent to ${adminEmail} for product: ${product.name}`);
        return true;
    } catch (err) {
        console.error('[Email Alert Error] Failed to dispatch email:', err.message);
        return false;
    }
};

module.exports = {
    sendOutOfStockAlert
};