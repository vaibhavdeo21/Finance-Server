const User = require('../model/users');

const rbacDao = {
    createUser: async (userData) => {
        return await User.create(userData);
    },
    
    // Optional: Helper to check existing users
    findUserByEmail: async (email) => {
        return await User.findOne({ email });
    }
};

module.exports = rbacDao;