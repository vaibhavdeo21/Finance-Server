// The Butler needs the User Cookie Cutter (Model) to know what he is looking for
const User = require('../model/users');

const userDao = {
    // This function looks for a user by their email address
    findByEmail: async (email) => {
        // We ask the database: "Find one person with this email"
        // 'await' means we wait for the answer before moving on
        const user = await User.findOne({ email });
        return user;
    },

    // This function creates a NEW user in the database
    create: async (userData) => {
        // We take the data and put it into our Cookie Cutter to make a new user shape
        const newUser = new User(userData);
        
        try {
            // We try to save this new user into the database permanently
            return await newUser.save();
        } catch (error) {
            // If something goes wrong (like an error), we check what happened
            
            // Error code 11000 means "Duplicate Key", which means that email is already taken!
            if (error.code === 11000) {
                const err = new Error();
                // We give the error a special name so we know what it is later
                err.code = 'USER_EXIST';
                // We throw the error like a ball back to the person who called us
                throw err;
            } else {
                // If it's a different error, we just print it to the screen
                console.log(error);
                const err = new Error('Something went wrong while communicating with DB');
                err.code = 'INTERNAL_SERVER_ERROR';
                throw err;
            }
        }
    }
};

[cite_start]// We let other files use this Butler [cite: 633-701]
module.exports = userDao;