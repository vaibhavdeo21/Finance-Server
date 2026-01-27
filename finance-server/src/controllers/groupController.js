/* OLD CODE:
// This file did not exist before.
*/

// NEW CODE:
// We bring in the Group Butler (DAO) to help us save groups
const groupDao = require("../dao/groupDao");

const groupController = {

    // This is the set of instructions for "How to Create a Group"
    create: async (request, response) => {
        try {
            // We open the user's message and take out the details
            const {
                name,
                description,
                adminEmail,
                membersEmail, // This is a list of friends
                thumbnail
            } = request.body;

            // We start a list of members. The Admin (creator) must be on the list!
            let allMembers = [adminEmail];
            
            // If the user sent a list of friends...
            if (membersEmail && Array.isArray(membersEmail)) {
                // ...we add them to our list.
                // We use 'Set' to make sure we don't write the same name twice!
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            // We ask the Butler to create the group in the database
            const newGroup = await groupDao.createGroup({
                name, 
                description, 
                adminEmail, 
                membersEmail: allMembers, 
                thumbnail,
                // We set the money counter to 0 because it's a new group
                paymentStatus: {
                    amount: 0,
                    currency: 'INR', // Using Rupees
                    date: Date.now(),
                    isPaid: false
                }
            });

            // If everything went well, we send a success message
            response.status(200).json({
                message: 'Group created',
                groupId: newGroup._id
            });

        } catch (error) {
            // If the Butler dropped the plate (error), we tell the user
            console.log(error);
            response.status(500).json({
                message: "Internal server error"
            });
        }
    }
};

// We share this Manager so the rest of the app can use it
module.exports = groupController;