/* ==========================================================================
   VERSION 1: BASIC ROUTES
   --------------------------------------------------------------------------
   We defined two paths: one for login, one for register.
   ========================================================================== */

// const express = require('express');
// const authController = require('../controllers/authController');
// const router = express.Router();

// router.post('/login', authController.login);
// router.post('/register', authController.register);

// module.exports = router;


/* ==========================================================================
   FINAL VERSION: (Still the same structure)
   --------------------------------------------------------------------------
   Even though we added JWT and Database logic, the Route Map stays simple.
   It just points to the Controller.
   ========================================================================== */

const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;