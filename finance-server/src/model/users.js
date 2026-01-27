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

// We create a Rule Book (Schema)
const userSchema = new mongoose.Schema({
    // Name is required
    name: { type: String, required: true },
    
    // Email is required AND must be unique (no duplicates)
    email: { type: String, required: true, unique: true },
    
    // Password is required
    password: { type: String, required: true }
});

[cite_start]// We create the Model (the cookie cutter) and share it [cite: 709-724]
module.exports = mongoose.model('User', userSchema);