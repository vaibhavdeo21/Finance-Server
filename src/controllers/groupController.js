const groupDao = require("../dao/groupDao");
const userDao = require("../dao/userDao");

const groupController = {

    create: async (request, response) => {
        try {
            const user = request.user;
            const { name, description, membersEmail, thumbnail } = request.body;

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

            response.status(201).json({
                message: 'Group created successfully',
                groupId: newGroup._id
            });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    update: async (request, response) => {
        try {
            const updatedGroup = await groupDao.updateGroup(request.body);
            if (!updatedGroup) {
                return response.status(404).json({ message: "Group not found" });
            }
            response.status(200).json(updatedGroup);
        } catch (error) {
            response.status(500).json({ message: "Error updating group" });
        }
    },

    addMembers: async (request, response) => {
        try {
            const { groupId, emails } = request.body;
            const updatedGroup = await groupDao.addMembers(groupId, ...emails);
            response.status(200).json(updatedGroup);
        } catch (error) {
            response.status(500).json({ message: "Error adding members" });
        }
    },

    removeMembers: async (request, response) => {
        try {
            const { groupId, emails } = request.body;
            const updatedGroup = await groupDao.removeMembers(groupId, ...emails);
            response.status(200).json(updatedGroup);
        } catch (error) {
            response.status(500).json({ message: "Error removing members" });
        }
    },

    getGroupsByUser: async (request, response) => {
        try {
            const user = request.user;
            
            // BUG FIX: If user is a child account (has adminId), fetch groups owned by their Admin.
            // Otherwise (if adminId is null or same as _id), fetch their own groups.
            let targetEmail = user.email;
            if (user.adminId && user.adminId !== user._id) {
                const adminUser = await userDao.findById(user.adminId);
                if (adminUser) {
                    targetEmail = adminUser.email;
                }
            }
            
            // Fetch groups where user is explicitly a member OR where their Parent Admin is the owner
            const groups = await groupDao.getGroupsForUser(user.email, targetEmail);
            
            response.status(200).json(groups);
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error fetching groups" });
        }
    },

    getGroupsByPaymentStatus: async (request, response) => {
        try {
            const { isPaid } = request.query;
            const status = isPaid === 'true';
            const groups = await groupDao.getGroupByStatus(status);
            response.status(200).json(groups);
        } catch (error) {
            response.status(500).json({ message: "Error filtering groups" });
        }
    },

    getAudit: async (request, response) => {
        try {
            const { groupId } = request.params;
            const lastSettled = await groupDao.getAuditLog(groupId);
            response.status(200).json({ lastSettled });
        } catch (error) {
            response.status(500).json({ message: "Error fetching audit log" });
        }
    }
};

module.exports = groupController;