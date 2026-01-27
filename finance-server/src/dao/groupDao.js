// We need the Group Rule Book
const Group = require("../model/group");

const groupDao = {
    // Function to create a new group
    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    // Function to update an existing group's details
    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;
        
        // Find the group by ID and update it with the new info
        // { new: true } means "Give me back the updated version, not the old one"
        return await Group.findByIdAndUpdate(groupId, {
            name, description, thumbnail, adminEmail, paymentStatus,
        }, { new: true });
    },

    // Function to add new members to a group
    addMembers: async (groupId, ...membersEmails) => {
        // $addToSet ensures we don't add the same person twice!
        return await Group.findByIdAndUpdate(groupId, {
            $addToSet: { membersEmail: { $each: membersEmails }}
        }, { new: true });
    },

    // Function to remove members (Placeholders for future code)
    removeMembers: async (...membersEmail) => {
        // Code to remove members will go here
    },

    // Function to find all groups a specific person belongs to
    getGroupByEmail: async (email) => {
        return await Group.find({ membersEmail: email });
    },

    // Placeholder
    getGroupByStatus: async (status) => {
    },

    /*
    * This function gets the history (audit log) of the group.
    * For now, it is empty.
    */
    getAuditLog: async (groupId) => {
    }
};

module.exports = groupDao;