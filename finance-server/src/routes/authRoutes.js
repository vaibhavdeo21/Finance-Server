// We bring in the express tool again
const express = require('express');

// We bring in the Manager (authController) we just wrote
const authController = require('../controllers/authController');

// We create a Router, which is like a mini-map for directions
const router = express.Router();

// If someone sends a POST message to '/login', go to the login function
router.post('/login', authController.login);

// If someone sends a POST message to '/register', go to the register function
router.post('/register', authController.register);

[cite_start]// We share this map so the main server can use it [cite: 463-469]
module.exports = router;