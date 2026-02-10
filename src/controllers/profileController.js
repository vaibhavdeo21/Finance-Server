const userDao = require("../dao/userDao");
const Users = require('../model/users'); // Import the User model

const usersController = {
    getUserInfo: async (request, response) => {
        try {
            const email = request.user.email;
            const user = await userDao.findByEmail(email);
            return response.json({ user: user });
        } catch (error) {
            return response.status(500).json({ message: 'Internal server error' });
        }
    },

    // NEW: Function to update profile details
    updateProfile: async (request, response) => {
        try {
            const { name } = request.body;
            const userId = request.user._id; // Extracted from the protect middleware

            // Find user and update the name field
            const updatedUser = await Users.findByIdAndUpdate(
                userId,
                { name: name },
                { new: true } // This returns the updated document instead of the old one
            );

            if (!updatedUser) {
                return response.status(404).json({ message: "User not found" });
            }

            return response.status(200).json({ 
                message: "Profile updated successfully", 
                user: updatedUser 
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = usersController;