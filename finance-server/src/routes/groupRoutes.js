/* OLD CODE:
// This file did not exist before.
*/

// NEW CODE:
const express = require('express');

// We connect this map to the Group Manager
const groupController = require('../controllers/groupController');

// We create the mini-map router
const router = express.Router();

// If someone knocks on the door marked "/create", send them to the 'create' function
router.post('/create', groupController.create);

// We publish this map
module.exports = router;