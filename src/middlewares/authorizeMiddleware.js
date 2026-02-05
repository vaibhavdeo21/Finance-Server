const { permissions } = require('../utility/permissions');

const authorizeMiddleware = (requiredPermission) => {
    return (request, response, next) => {
        const userRole = request.user.role; // This comes from authMiddleware decoding the token
        const userPermissions = permissions[userRole];

        if (userPermissions && userPermissions.includes(requiredPermission)) {
            next();
        } else {
            response.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }
    };
};

module.exports = authorizeMiddleware;