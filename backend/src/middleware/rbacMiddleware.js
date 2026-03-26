const rolePermissions = {
    Admin: ['device:read', 'relay:toggle', 'user:manage'],
    Operator: ['device:read', 'relay:toggle'],
    Viewer: ['device:read']
};

export const requirePermission = (action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        
        const hasPermission = userRoles.some(role => 
            rolePermissions[role]?.includes(action)
        );

        if (!hasPermission) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
