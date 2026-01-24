const mongoose = require('mongoose');

// Define the User Schema structure for MongoDB
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Ensures no duplicate emails in DB
    },
    password: { 
        type: String, 
        required: true 
    }
});

// Export the model based on the schema
module.exports = mongoose.model('User', userSchema);