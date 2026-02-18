const { Product, Designer, UserActivity } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Helper function to log user activity
const logActivity = async (action, entityType, entityId, description, req) => {
    try {
        await UserActivity.create({
            userId: req.headers['x-user-id'] || req.headers['x-user-name'] || 'Dharaneesh C',
            sessionId: req.headers['x-session-id'] || req.sessionID || null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            action,
            entityType,
            entityId,
            description,
            success: true
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Helper function to get user-friendly action text
const getActionText = (activity) => {
    const entityType = activity.entityType || '';
    const action = activity.action;
    
    // Map actions to user-friendly descriptions
    if (action === 'CREATE') {
        if (entityType === 'PRODUCT' || entityType === 'PRODUCTS') return 'New Product Added';
        if (entityType === 'DESIGNER' || entityType === 'DESIGNERS') return 'New Designer Added';
        if (entityType === 'SALE') return 'New Sale Created';
        if (entityType === 'PURCHASE') return 'New Purchase Order Created';
        if (entityType === 'INVOICE') return 'New Invoice Generated';
        return 'New Item Created';
    }
    if (action === 'UPDATE') {
        if (entityType === 'PRODUCT' || entityType === 'PRODUCTS') return 'Product Updated';
        if (entityType === 'DESIGNER' || entityType === 'DESIGNERS') return 'Designer Information Updated';
        if (entityType === 'PREFERENCES') return 'General Preferences Updated';
        if (entityType === 'ORGANIZATION') return "Organization's Personally Identifiable Information (PII) has been updated";
        return 'Information Updated';
    }
    if (action === 'DELETE') {
        if (entityType === 'PRODUCT' || entityType === 'PRODUCTS') return 'Product Deleted';
        if (entityType === 'DESIGNER' || entityType === 'DESIGNERS') return 'Designer Removed';
        return 'Item Deleted';
    }
    if (action === 'VIEW') {
        return null; // Don't show view actions in recent activities
    }
    return activity.description || action;
};

// Helper function to get icon for entity type
const getEntityIcon = (entityType, action) => {
    if (action === 'CREATE') {
        if (entityType === 'PRODUCT' || entityType === 'PRODUCTS') return '📦';
        if (entityType === 'DESIGNER' || entityType === 'DESIGNERS') return '👤';
        if (entityType === 'SALE') return '💰';
        if (entityType === 'PURCHASE') return '🛒';
        if (entityType === 'INVOICE') return '🧾';
    }
    if (action === 'UPDATE') {
        if (entityType === 'PREFERENCES') return '⚙️';
        if (entityType === 'ORGANIZATION') return '📄';
        return '✏️';
    }
    if (action === 'DELETE') return '🗑️';
    
    const iconMap = {
        'PRODUCT': '📦',
        'PRODUCTS': '📦',
        'DESIGNER': '👤',
        'DESIGNERS': '👤',
        'DASHBOARD': '📊',
        'INVOICE': '🧾',
        'SALE': '💰',
        'PURCHASE': '🛒'
    };
    return iconMap[entityType] || '📄';
};

// @desc    Get dashboard metrics
// @route   GET /api/dashboard
// @access  Public
exports.getDashboardMetrics = async (req, res) => {
    try {
        // Get all products with populated designer data
        const products = await Product.findAll({
            include: [{
                model: Designer,
                as: 'designer',
                attributes: ['id', 'name', 'email', 'status']
            }]
        });
        
        // Calculate dashboard metrics
        const totalItems = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
        
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let suggestedReorderValue = 0;
        
        products.forEach(product => {
            if (product.outOfStock()) {
                outOfStockCount++;
                suggestedReorderValue += parseFloat(product.cost) * 10;
            } else if (product.lowStock()) {
                lowStockCount++;
                suggestedReorderValue += parseFloat(product.cost) * 10;
            }
        });
        
        // Get unique product types count
        const typesResult = await Product.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('type')), 'type']],
            raw: true
        });
        const itemGroups = typesResult.length;
        
        // Calculate Pending Actions with real data
        // INVENTORY Section
        const belowReorderLevel = products.filter(p => p.lowStock() || p.outOfStock()).length;
        
        // SALES Section (using placeholder data for now - will be updated when sales/invoices modules are added)
        const toBePacked = 0;
        const toBeShipped = 0;
        const toBeDelivered = 0;
        const toBeInvoiced = 0;
        
        // PURCHASES Section (placeholder - will be updated when purchase orders module is added)
        const toBeReceived = 0;
        const receiveInProgress = 0;
        
        // Determine stock risk level
        let stockRiskLevel = 'low';
        if (lowStockCount > 5 || outOfStockCount > 2) {
            stockRiskLevel = 'high';
        } else if (lowStockCount > 2 || outOfStockCount > 0) {
            stockRiskLevel = 'medium';
        }
        
        // Get top products by quantity
        const topProducts = products
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 4);
        
        // Get recent activities (excluding VIEW actions, last 15)
        const recentActivities = await UserActivity.findAll({
            where: {
                action: {
                    [Op.ne]: 'VIEW' // Exclude VIEW actions
                }
            },
            order: [['createdAt', 'DESC']],
            limit: 15,
            attributes: ['id', 'action', 'entityType', 'entityId', 'description', 'userId', 'createdAt']
        });
        
        // Format activities for frontend
        const formattedActivities = recentActivities
            .map(activity => {
                const actionText = getActionText(activity);
                if (!actionText) return null; // Skip if no action text (e.g., VIEW actions)
                
                return {
                    id: activity.id,
                    action: actionText,
                    entityType: activity.entityType,
                    entityId: activity.entityId,
                    description: activity.description,
                    userName: activity.userId || 'System User',
                    icon: getEntityIcon(activity.entityType, activity.action),
                    timestamp: activity.createdAt
                };
            })
            .filter(activity => activity !== null); // Remove null entries
        
        await logActivity('VIEW', 'DASHBOARD', null, 'Viewed dashboard metrics', req);
        
        res.json({
            totalItems,
            totalStock,
            lowStockCount,
            outOfStockCount,
            itemGroups,
            stockRiskLevel,
            suggestedReorder: suggestedReorderValue.toFixed(2),
            topProducts,
            pendingActions: {
                sales: {
                    toBePacked,
                    toBeShipped,
                    toBeDelivered,
                    toBeInvoiced
                },
                purchases: {
                    toBeReceived,
                    receiveInProgress
                },
                inventory: {
                    belowReorderLevel
                }
            },
            recentActivities: formattedActivities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
