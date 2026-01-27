// We are bringing in the mongoose tool, which helps us talk to the database
const mongoose = require('mongoose');

// Here we are creating a Rule Book (Schema) for what a User looks like
const userSchema = new mongoose.Schema({
    // Every user MUST have a name, and it must be text (String)
    name: { type: String, required: true },
    
    // Every user MUST have an email, it must be text, and it must be unique (no two people can have the same email)
    email: { type: String, required: true, unique: true },
    
    // Every user MUST have a password to stay safe
    password: { type: String, required: true }
});

// We are turning this Rule Book into a real Model so we can make new users later
[cite_start]// We export it so other files can use this cookie cutter [cite: 709-724]
module.exports = mongoose.model('User', userSchema);