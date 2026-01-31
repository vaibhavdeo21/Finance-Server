/* ==========================================================================
   VERSION 1: NO FILE (Day 1)
   --------------------------------------------------------------------------
   In the beginning, we did not have a database model.
   We just used a variable in server.js:
   // let users = [];
   ========================================================================== */

/* ==========================================================================
   FINAL VERSION: USER BLUEPRINT (Schema)
   --------------------------------------------------------------------------
   We created this when we connected MongoDB.
   This tells the database what a "User" looks like.
   ========================================================================== */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // <-- CHANGE to false
    googleId: { type: String, required: false }  // <-- ADD THIS
});

module.exports = mongoose.model('User', userSchema);