/* ==========================================================================
   VERSION 1: NO GROUP MODEL
   --------------------------------------------------------------------------
   At the start of the project, we didn't have groups.
   This file did not exist.
   ========================================================================== */

/* ==========================================================================
   FINAL VERSION: GROUP BLUEPRINT
   --------------------------------------------------------------------------
   This tells MongoDB what a Group looks like.
   ========================================================================== */

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    
    // Who is the boss of the group?
    adminEmail: { type: String, required: true },
    
    createdAt: { type: Date, default: Date.now() },
    
    // List of members
    membersEmail: [String],
    
    thumbnail: { type: String, required: false },
    
    // Money tracking
    paymentStatus: {
        amount: Number,
        currency: String,
        date: Date,
        isPaid: Boolean
    }
});

module.exports = mongoose.model('Group', groupSchema); [cite_start]// [cite: 991-1034]