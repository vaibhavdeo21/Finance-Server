const ADMIN_ROLE = 'admin';
const MANAGER_ROLE = 'manager';
const VIEWER_ROLE = 'viewer';

const permissions = {
    [ADMIN_ROLE]: [
        'user:create',
        'user:update',
        'user:delete',
        'user:view',
        'group:create',
        'group:update',
        'group:delete',
        'group:view'
    ],
    [MANAGER_ROLE]: [
        'user:view',
        'group:create',
        'group:update',
        'group:view'
    ],
    [VIEWER_ROLE]: [
        'user:view',
        'group:view'
    ]
};

module.exports = {
    ADMIN_ROLE,
    MANAGER_ROLE,
    VIEWER_ROLE,
    permissions
};