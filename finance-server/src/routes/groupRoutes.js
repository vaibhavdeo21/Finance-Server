const express = require('express');
const groupController = require('../controllers/groupController');

// NEW: We hire the Security Guard
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/* ==========================================================================
   VERSION 1: OPEN DOORS (Unsafe)
   --------------------------------------------------------------------------
   Anyone could create a group. There was no check to see if they were logged in.
   ========================================================================== */

// // router.post('/create', groupController.create);


/* ==========================================================================
   FINAL VERSION: GUARDED DOORS (Safe)
   --------------------------------------------------------------------------
   Now we tell the Guard (authMiddleware) to protect the door.
   Only people with a Token can pass.
   ========================================================================== */

// NEW: Protect everything below this line
router.use(authMiddleware.protect);

router.post('/create', groupController.create);

module.exports = router;