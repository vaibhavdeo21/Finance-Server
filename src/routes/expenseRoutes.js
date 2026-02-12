const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

// Global stats (not group specific)
router.get('/dashboard-stats', authMiddleware.protect, expenseController.getDashboardStats);

// REMOVED authorizeMiddleware: The Controller now manages role-based access
router.post('/add', expenseController.addExpense);
router.post('/reopen', expenseController.reopenGroup);
router.post('/request-settle', expenseController.requestSettlement);
router.post('/confirm-settle', expenseController.confirmSettlement);

// KEPT: Simple auth for viewing
router.get('/:groupId', expenseController.getGroupExpenses);
router.get('/:groupId/summary', expenseController.getGroupSummary);

module.exports = router;