const Group = require('../model/groups'); // Assuming you have a Group model

const groupDao = {
    createGroup: async (groupData) => {
        return await Group.create(groupData);
    },

    updateGroup: async (groupData) => {
        return await Group.findByIdAndUpdate(groupData._id, groupData, { new: true });
    },

    addMembers: async (groupId, ...membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { membersEmail: { $each: membersEmail } } },
            { new: true }
        );
    },

    removeMembers: async (groupId, ...membersEmails) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $pull: { membersEmail: { $in: membersEmails } } },
            { new: true }
        );
    },

    getGroupByEmail: async (email) => {
        // Find groups where this email is listed in membersEmail
        return await Group.find({ membersEmail: email });
    },

    getGroupByStatus: async (status) => {
        // Querying based on the nested paymentStatus.isPaid boolean
        return await Group.find({ "paymentStatus.isPaid": status });
    },

    /**
     * @param {*} groupId 
     */
    getAuditLog: async (groupId) => {
        // Based on your schema, the most relevant "settled" info is the date within paymentStatus.
        const group = await Group.findById(groupId).select('paymentStatus.date');
        return group ? group.paymentStatus.date : null;
    }
};

module.exports = groupDao;