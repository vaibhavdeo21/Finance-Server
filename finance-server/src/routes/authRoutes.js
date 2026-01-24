const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Route for login
router.post('/login', authController.login);

// Route for register
router.post('/register', authController.register);

module.exports = router;