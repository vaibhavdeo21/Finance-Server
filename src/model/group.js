const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    adminEmail: { type: String, required: true },
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    createdAt: { type: Date, default: Date.now }, 
    membersEmail: [String],
    thumbnail: { type: String, required: false },
    paymentStatus: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        date: { type: Date },
        isPaid: { type: Boolean, default: false },
        // NEW: Tracks if a user has requested a settlement
        isPendingApproval: { type: Boolean, default: false },
        // NEW: Stores the email of the user who requested the settlement
        requestedBy: { type: String, default: null }
    }
});

module.exports = mongoose.model('Group', groupSchema);