const express = require('express');
const rbacController = require('../controllers/rbacController');
const authMiddleware = require('../middlewares/authMiddleware');
// You would likely import an 'authorize' middleware here as well
// const authorize = require('../middlewares/authorizeMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

// Endpoint to create a new user (admin/manager only)
// Example usage: router.post('/create', authorize('user:create'), rbacController.create);
router.post('/create', rbacController.create); 

module.exports = router;