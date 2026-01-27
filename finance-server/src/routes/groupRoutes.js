const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// The Security Guard protects all these routes!
router.use(authMiddleware.protect);

// 1. Create a Group
router.post('/create', groupController.create);

/* OLD CODE:
// We only had the create route before.
*/

// NEW CODE:
// 2. Update Group Details
router.post('/update', groupController.updateGroup);

// 3. Add Members to a Group
router.post('/add-members', groupController.addMembers);

// 4. Remove Members from a Group
router.post('/remove-members', groupController.removeMembers);

// 5. Get all my groups (We don't need to send email, the token has it!)
router.get('/list', groupController.getGroupByEmail);

// 6. Get groups by Status (e.g., /status/true or /status/false)
router.get('/status/:isPaid', groupController.getGroupByStatus);

// 7. Get Audit Log for a specific group ID
router.get('/audit/:groupId', groupController.getAuditLog);

module.exports = router;