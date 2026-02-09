const Group = require("../model/group");

const groupDao = {
    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;

        return await Group.findByIdAndUpdate(groupId, {
            name, description, thumbnail, adminEmail, paymentStatus,
        }, { new: true });
    },

    addMembers: async (groupId, ...membersEmails) => {
        return await Group.findByIdAndUpdate(groupId, {
            $addToSet: { membersEmail: { $each: membersEmails } }
        }, { new: true });
    },

    removeMembers: async (groupId, ...membersEmails) => {
        return await Group.findByIdAndUpdate(groupId, {
            $pull: { membersEmail: { $in: membersEmails } }
        }, { new: true });
    },

    getGroupByEmail: async (email) => {
        return await Group.find({ membersEmail: email });
    },

    // RBAC FIX: Custom query to find groups for member OR parent admin
    getGroupsForUser: async (userEmail, adminEmail) => {
        return await Group.find({
            $or: [
                { membersEmail: userEmail },     // I am a member
                { adminEmail: userEmail },       // I am the admin/owner
                { adminEmail: adminEmail }       // My Parent Admin owns the group
            ]
        });
    },

    getGroupByStatus: async (status) => {
        return await Group.find({ "paymentStatus.isPaid": status });
    },

    getGroupsPaginated: async (email, limit, skip) => {
        const [groups, totalCount] = await Promise.all([
            // Query 1: Fetch specific page
            Group.find({ membersEmail: email })
                .sort({ createdAt: -1 }) // Sort by newest first
                .skip(skip)
                .limit(limit),

            // Query 2: Count total records for metadata
            Group.countDocuments({ membersEmail: email })
        ]);

        return { groups, totalCount };
    },
    
    getAuditLog: async (groupId) => {
        const group = await Group.findById(groupId).select('paymentStatus.date');
        return group ? group.paymentStatus.date : null;
    }
};

module.exports = groupDao;