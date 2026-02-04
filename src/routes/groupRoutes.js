const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware'); // Ensure this path is correct

// Protect all group routes
router.use(authMiddleware.protect);

router.post('/create', groupController.create);
router.put('/update', groupController.update);
router.patch('/members/add', groupController.addMembers);
router.patch('/members/remove', groupController.removeMembers);
router.get('/my-groups', groupController.getGroupsByUser);
router.get('/status', groupController.getGroupsByPaymentStatus);
router.get('/:groupId/audit', groupController.getAudit);

module.exports = router;