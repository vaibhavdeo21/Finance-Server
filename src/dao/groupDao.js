const Group = require("../model/group");

const groupDao = {
    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    updateGroup: async (data) => {
        const { groupId, ...updateData } = data; // Use rest operator to capture all fields

        // findByIdAndUpdate with updateData will only update the fields provided in the request
        return await Group.findByIdAndUpdate(
            groupId,
            { $set: updateData },
            { new: true }
        );
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

    getGroupsForUser: async (userEmail, adminEmail) => {
        return await Group.find({
            $or: [
                { membersEmail: userEmail },
                { adminEmail: userEmail },
                { adminEmail: adminEmail }
            ]
        });
    },

    getGroupByStatus: async (status) => {
        return await Group.find({ "paymentStatus.isPaid": status });
    },

    getAuditLog: async (groupId) => {
        const group = await Group.findById(groupId).select('paymentStatus.date');
        return group ? group.paymentStatus.date : null;
    },

    // Updated with Sorting Logic
    getGroupsPaginated: async (email, adminId, limit, skip, sortOptions = { createdAt: -1 }) => {
        // Query allows hierarchy: User email match OR Admin workspace match
        const query = {
            $or: [
                { membersEmail: email },
                { adminId: adminId }
            ]
        };

        const [groups, totalCount] = await Promise.all([
            Group.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            Group.countDocuments(query)
        ]);

        return { groups, totalCount };
    }
};

module.exports = groupDao;