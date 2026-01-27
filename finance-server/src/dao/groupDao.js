const Group = require("../model/group");

const groupDao = {
    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    // This function updates the group details (like name or description)
    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;
        
        /* OLD CODE:
        // We didn't have this function fully working before
        */

        // NEW CODE:
        // We find the group by its ID and change the details
        // { new: true } means "Show me the new version after you change it"
        return await Group.findByIdAndUpdate(groupId, {
            name, description, thumbnail, adminEmail, paymentStatus,
        }, { new: true });
    },

    addMembers: async (groupId, ...membersEmails) => {
        // We use $addToSet to add friends to the list. 
        // It's smart: if the friend is already there, it won't add them again!
        return await Group.findByIdAndUpdate(groupId, {
            $addToSet: { membersEmail: { $each: membersEmails }}
        }, { new: true });
    },

    // NEW FUNCTION: Remove a friend from the group
    removeMembers: async (groupId, memberEmail) => {
        // We use $pull to "pull" (remove) the specific email from the list
        return await Group.findByIdAndUpdate(groupId, {
            $pull: { membersEmail: memberEmail }
        }, { new: true });
    },

    getGroupByEmail: async (email) => {
        // We search for all groups where this person's email is in the 'membersEmail' list
        return await Group.find({ membersEmail: email });
    },

    // NEW FUNCTION: Find groups based on if they are Paid or Not Paid
    getGroupByStatus: async (status) => {
        // We look inside the 'paymentStatus' box to see if 'isPaid' matches what we want
        return await Group.find({ 'paymentStatus.isPaid': status });
    },

    // NEW FUNCTION: Get the history of the group
    getAuditLog: async (groupId) => {
        // For now, we just find the group and return its info
        // Later, we can add a special list of "Who did what"
        return await Group.findById(groupId);
    }
};

module.exports = groupDao;