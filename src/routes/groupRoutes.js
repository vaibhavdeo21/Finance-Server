const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');

router.use(authMiddleware.protect);

// Group Creation and Updates require specific permissions
router.post('/create', authorizeMiddleware('group:create'), groupController.create);
router.put('/update', authorizeMiddleware('group:update'), groupController.update);
router.patch('/members/add', authorizeMiddleware('group:update'), groupController.addMembers);
router.patch('/members/remove', authorizeMiddleware('group:update'), groupController.removeMembers);

// Viewing groups requires view permission
router.get('/my-groups', groupController.getGroupsByUser); // This might be open to all logged in users or restricted
router.get('/status', authorizeMiddleware('group:view'), groupController.getGroupsByPaymentStatus);
router.get('/:groupId/audit', authorizeMiddleware('group:view'), groupController.getAudit);

module.exports = router;