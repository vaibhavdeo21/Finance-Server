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
        amount: Number,
        currency: String,
        date: Date,
        isPaid: { type: Boolean, default: false },
    }
});

module.exports = mongoose.model('Group', groupSchema);