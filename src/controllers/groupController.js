const groupDao = require("../dao/groupDao");
const userDao = require("../dao/userDao");
const Expense = require('../model/expense');
const Group = require('../model/group');

const groupController = {

    create: async (request, response) => {
        try {
            const user = request.user; // Contains _id and email from your authMiddleware
            const { name, description, membersEmail, thumbnail } = request.body;
            const userInfo = await userDao.findByEmail(user.email);

            // Credit check logic...
            if (!userInfo.credits) {
                userInfo.credits = 1;
            }

            if (userInfo.credits == 0) {
                return response.status(400).json({
                    message: 'You do not have enough credits to perform this operation'
                });
            }

            let allMembers = [user.email];
            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            // UPDATED: Pass adminId to match your required Schema
            const newGroup = await groupDao.createGroup({
                name,
                description,
                adminEmail: user.email,
                adminId: user._id, // CRITICAL: Extracting _id from the authenticated user
                membersEmail: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false,
                    isPendingApproval: false, // Ensure defaults are set for new flow
                    requestedBy: null         // Ensure defaults are set for new flow
                }
            });

            userInfo.credits -= 1;
            await userInfo.save();

            response.status(201).json({
                message: 'Group created successfully',
                groupId: newGroup._id
            });
        } catch (error) {
            console.error("Group Create Error:", error);
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


    deleteGroup: async (request, response) => {
        try {
            const { groupId } = request.params;
            const userId = request.user._id;

            const group = await Group.findById(groupId);

            if (!group) {
                return response.status(404).json({ message: "Group not found" });
            }

            // Authorization Check: Only Admin can delete
            if (group.adminId.toString() !== userId.toString()) {
                return response.status(403).json({ message: "Only the Group Admin can delete this group" });
            }

            // 1. Delete all expenses associated with this group first
            await Expense.deleteMany({ groupId: groupId });

            // 2. Delete the group itself
            await Group.findByIdAndDelete(groupId);

            response.status(200).json({ message: "Group and all associated expenses deleted successfully" });
        } catch (error) {
            console.error("Delete Group Error:", error);
            response.status(500).json({ message: "Error deleting group" });
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
            // Standardizing access by using both email and adminId from JWT
            const { email, adminId } = request.user;

            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;
            const sortBy = request.query.sortBy || 'newest';

            let sortOptions = { createdAt: -1 };
            if (sortBy === 'oldest') {
                sortOptions = { createdAt: 1 };
            }

            // DAO now accepts adminId to support hierarchical viewing
            const { groups, totalCount } = await groupDao.getGroupsPaginated(
                email,
                adminId,
                limit,
                skip,
                sortOptions
            );

            response.status(200).json({
                groups: groups,
                pagination: {
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: page,
                    itemsPerPage: limit
                }
            });
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
    },

    updateBudgetGoal: async (request, response) => {
        try {
            const { groupId } = request.params;
            const { budgetGoal } = request.body; // Ensure this matches the frontend key

            const updatedGroup = await Group.findByIdAndUpdate(
                groupId,
                { budgetGoal: Number(budgetGoal) },
                { new: true } // Returns the updated document
            );

            if (!updatedGroup) return response.status(404).json({ message: "Group not found" });

            response.status(200).json({ message: "Budget updated", budgetGoal: updatedGroup.budgetGoal });
        } catch (error) {
            response.status(500).json({ message: "Server error updating budget" });
        }
    }
};

module.exports = groupController;