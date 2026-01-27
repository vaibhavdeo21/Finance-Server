/* ==========================================================================
   VERSION 1: FAKE DATABASE HELPER (userDb.js)
   --------------------------------------------------------------------------
   This file used to be just a list in memory.
   It was deleted when we moved to MongoDB, but here is what it looked like:
   ========================================================================== */

// // This was just a list in memory
// // const users = [
// //     { id: 1, name: "Admin", email: "admin@test.com", password: "123" }
// // ];
// // module.exports = users;


/* ==========================================================================
   FINAL VERSION: REAL DATABASE BUTLER (DAO)
   --------------------------------------------------------------------------
   Now it talks to MongoDB using the User Model.
   ========================================================================== */

const User = require('../model/users');

const userDao = {
    // Find a person by email
    findByEmail: async (email) => {
        const user = await User.findOne({ email });
        return user;
    },

    // Create a new person
    create: async (userData) => {
        const newUser = new User(userData);
        
        try {
            return await newUser.save();
        } catch (error) {
            // Check if the error is "Duplicate Key" (Email already exists)
            // Error code 11000 means "Duplicate" in MongoDB
            if (error.code === 11000) {
                const err = new Error();
                err.code = 'USER_EXIST';
                throw err;
            } else {
                console.log(error);
                const err = new Error('Something went wrong while communicating with DB');
                err.code = 'INTERNAL_SERVER_ERROR';
                throw err;
            }
        }
    }
};

module.exports = userDao; [cite_start]// [cite: 633-701]