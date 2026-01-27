/* ==========================================================================
   VERSION 1: NO GROUP DAO
   --------------------------------------------------------------------------
   We didn't have any group logic in the beginning.
   ========================================================================== */

/* ==========================================================================
   FINAL VERSION: GROUP BUTLER
   --------------------------------------------------------------------------
   Handles saving and updating groups in the database.
   ========================================================================== */

const Group = require("../model/group");

const groupDao = {
    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;
        // 'new: true' means return the UPDATED group, not the old one
        return await Group.findByIdAndUpdate(groupId, {
            name, description, thumbnail, adminEmail, paymentStatus,
        }, { new: true });
    },

    addMembers: async (groupId, ...membersEmails) => {
        // $addToSet ensures we don't add the same friend twice
        return await Group.findByIdAndUpdate(groupId, {
            $addToSet: { membersEmail: { $each: membersEmails }}
        }, { new: true });
    },

    removeMembers: async (groupId, memberEmail) => {
        return await Group.findByIdAndUpdate(groupId, {
            $pull: { membersEmail: memberEmail }
        }, { new: true });
    },

    getGroupByEmail: async (email) => {
        // Find all groups where this person is a member
        return await Group.find({ membersEmail: email });
    },

    getGroupByStatus: async (status) => {
        return await Group.find({ 'paymentStatus.isPaid': status });
    },

    getAuditLog: async (groupId) => {
        return await Group.findById(groupId);
    }
};

module.exports = groupDao;