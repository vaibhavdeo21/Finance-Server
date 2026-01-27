const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    // Name of the group (Must have one)
    name: { type: String, required: true },
    
    // Description of the group (Optional)
    description: { type: String, required: false },
    
    // The email of the boss of the group (Must have one)
    adminEmail: { type: String, required: true },
    
    // When the group was created (Defaults to "Right Now")
    createdAt: { type: Date, default: Date.now() },
    
    // A list of emails for everyone in the group
    membersEmail: [String],
    
    // A picture for the group (Optional)
    thumbnail: { type: String, required: false },
    
    // Information about money status
    paymentStatus: {
        amount: Number,
        currency: String,
        date: Date,
        isPaid: Boolean
    }
});

module.exports = mongoose.model('Group', groupSchema);