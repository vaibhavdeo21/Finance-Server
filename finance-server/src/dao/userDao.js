const User = require('../model/users'); // Import the Mongoose Model

const userDao = {
    
    // Find a user by their email address
    findByEmail: async (email) => {
        // Mongoose 'findOne' returns a promise
        const user = await User.findOne({ email });
        return user;
    },

    // Create a new user in the database
    create: async (userData) => {
        const newUser = new User(userData);
        
        try {
            // Save the new user to MongoDB
            return await newUser.save();
        } catch (error) {
            // Check for MongoDB duplicate key error (code 11000)
            if (error.code === 11000) {
                const err = new Error();
                err.code = 'USER_EXIST'; // Custom error code for controller to handle
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

/* // OLD CODE (Source 2 - userDb.js): This was the dummy database file
// const users = [];
// module.exports = users;
*/

module.exports = userDao;