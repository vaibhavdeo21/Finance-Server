const groupDao = require("../dao/groupDao");

const groupController = {

    create: async (request, response) => {
        try {
            const { name, description, membersEmail, thumbnail } = request.body;
            const user = request.user; 
            let allMembers = [user.email];

            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            const newGroup = await groupDao.createGroup({
                name,
                description,
                adminEmail: user.email,
                membersEmail: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false
                }
            });

            response.status(200).json({
                message: 'Group created',
                groupId: newGroup._id
            });
        } catch (error) {
            console.log(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    // NEW FUNCTION: Update Group Details
    updateGroup: async (request, response) => {
        try {
            // We get the updates from the message
            const { groupId, name, description, thumbnail } = request.body;

            // We ask the Butler (DAO) to make the changes
            const updatedGroup = await groupDao.updateGroup({
                groupId,
                name,
                description,
                thumbnail
            });

            // We send the new details back to the user
            response.status(200).json({
                message: "Group updated",
                group: updatedGroup
            });

        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    // NEW FUNCTION: Add new friends to the group
    addMembers: async (request, response) => {
        try {
            // We need the Group ID and the list of new emails
            const { groupId, membersEmail } = request.body;

            // We ask the Butler to add these people
            const updatedGroup = await groupDao.addMembers(groupId, ...membersEmail);

            response.status(200).json({
                message: "Members added",
                group: updatedGroup
            });
        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    // NEW FUNCTION: Remove a friend from the group
    removeMembers: async (request, response) => {
        try {
            // We need the Group ID and the email of the person to remove
            const { groupId, memberEmail } = request.body;

            // We ask the Butler to remove this person
            const updatedGroup = await groupDao.removeMembers(groupId, memberEmail);

            response.status(200).json({
                message: "Member removed",
                group: updatedGroup
            });
        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    // NEW FUNCTION: Find all groups for a specific email
    getGroupByEmail: async (request, response) => {
        try {
            // We look at the Token (Badge) to see who is asking
            const userEmail = request.user.email;

            // We ask the Butler to find all groups for this person
            const groups = await groupDao.getGroupByEmail(userEmail);

            response.status(200).json({
                message: "Groups fetched",
                groups: groups
            });
        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    // NEW FUNCTION: Find groups based on payment status (Paid/Unpaid)
    getGroupByStatus: async (request, response) => {
        try {
            // We get the status (true or false) from the URL (e.g., /status/true)
            const { isPaid } = request.params; 

            // We ask the Butler to find the groups
            const groups = await groupDao.getGroupByStatus(isPaid);

            response.status(200).json({
                message: "Groups fetched by status",
                groups: groups
            });
        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    // NEW FUNCTION: Get the audit log (history)
    getAuditLog: async (request, response) => {
        try {
            // We get the Group ID from the URL
            const { groupId } = request.params;

            // We ask the Butler for the log
            const log = await groupDao.getAuditLog(groupId);

            response.status(200).json({
                message: "Audit log fetched",
                log: log
            });
        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = groupController;