const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    paidBy: { type: String, required: true }, // Email of the payer
    splitType: { type: String, enum: ['EQUAL', 'UNEQUAL'], default: 'EQUAL' },
    
    // Tracks each member's share and settlement status
    splitDetails: [{
        memberEmail: String,
        amountOwed: Number,
        isSettled: { type: Boolean, default: false }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);