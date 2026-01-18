const mongoose = require('mongoose');
const Expense = require('../model/expense');
const Group = require('../model/group');
const User = require('../model/users');

const expenseController = {
    addExpense: async (request, response) => {
        try {
            const { groupId, description, amount, payerEmail, splits } = request.body;
            const userEmail = request.user.email;

            const group = await Group.findById(groupId);
            if (!group) return response.status(404).json({ message: "Group not found" });

            const member = group.members.find(m =>
                (typeof m === 'string' ? m : m.email) === userEmail
            );

            const userRole = typeof member === 'object' ? member.role?.toLowerCase() : 'viewer';

            const canAddExpense =
                userRole === 'admin' ||
                userRole === 'manager' ||
                userRole === 'treasurer' ||
                group.adminEmail === userEmail;

            if (!canAddExpense) {
                return response.status(403).json({ message: "Access Denied: You do not have permission to add expenses." });
            }

            const newExpense = new Expense({
                groupId,
                description,
                amount,
                payerEmail,
                splits,
                date: new Date()
            });

            await newExpense.save();
            response.status(201).json(newExpense);
        } catch (error) {
            console.error("Add Expense Error:", error);
            response.status(500).json({ message: "Internal Server Error: Check member data format" });
        }
    },

    getGroupExpenses: async (request, response) => {
        try {
            const { groupId } = request.params;
            const expenses = await Expense.find({ groupId }).sort({ date: -1 });

            const payerEmails = [...new Set(expenses.map(exp => exp.payerEmail))];
            const users = await User.find({ email: { $in: payerEmails } }, 'name email');

            const enrichedExpenses = expenses.map(expense => {
                const user = users.find(u => u.email === expense.payerEmail);
                return {
                    ...expense.toObject(),
                    payerName: user ? user.name : expense.payerEmail.split('@')[0]
                };
            });

            response.status(200).json(enrichedExpenses);
        } catch (error) {
            console.error("Fetch Expenses Error:", error);
            response.status(500).json({ message: "Error fetching expenses" });
        }
    },

    getGroupSummary: async (request, response) => {
        try {
            const { groupId } = request.params;
            const expenses = await Expense.find({ groupId, isSettled: false });

            let emailBalances = {};
            expenses.forEach(expense => {
                if (!emailBalances[expense.payerEmail]) emailBalances[expense.payerEmail] = 0;
                emailBalances[expense.payerEmail] += expense.amount;

                expense.splits.forEach(split => {
                    if (!emailBalances[split.email]) emailBalances[split.email] = 0;
                    emailBalances[split.email] -= split.amount;
                });
            });

            const emails = Object.keys(emailBalances);
            const users = await User.find({ email: { $in: emails } }, 'name email');

            const balances = {};
            emails.forEach(email => {
                const userData = users.find(u => u.email === email);
                balances[email] = {
                    amount: emailBalances[email],
                    name: userData ? userData.name : email.split('@')[0]
                };
            });

            response.status(200).json({ balances });
        } catch (error) {
            console.error("Summary Error:", error);
            response.status(500).json({ message: "Error calculating summary" });
        }
    },

    settleGroup: async (request, response) => {
        try {
            const { groupId } = request.body;

            await Expense.updateMany(
                { groupId: groupId, isSettled: false },
                { $set: { isSettled: true } }
            );

            await Group.findByIdAndUpdate(groupId, {
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: true
                }
            });

            response.status(200).json({ message: "Group settled successfully" });
        } catch (error) {
            response.status(500).json({ message: "Error settling group" });
        }
    },

    // src/controllers/expenseController.js

    requestSettlement: async (request, response) => {
        try {
            const { groupId } = request.body;
            // Normalize the email to lowercase for consistent matching
            const requesterEmail = request.user.email.toLowerCase();

            // Use a case-insensitive regex to find the member in the array
            const group = await Group.findOneAndUpdate(
                {
                    _id: groupId,
                    "members.email": { $regex: new RegExp(`^${requesterEmail}$`, "i") }
                },
                {
                    $set: { "members.$.settlementStatus": "requested" }
                },
                { new: true }
            );

            if (!group) {
                return response.status(404).json({ message: "Member not found in this group" });
            }

            response.status(200).json({ message: "Settlement request sent!" });
        } catch (error) {
            console.error("Request Error:", error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    approveMemberSettlement: async (request, response) => {
        try {
            const { groupId, memberEmail } = request.body; // memberEmail is the person who paid
            const userEmail = request.user.email; // Person clicking 'Confirm'

            const group = await Group.findById(groupId);
            if (!group) return response.status(404).json({ message: "Group not found" });

            // 1. Calculate real-time balances to see who is getting money
            const expenses = await Expense.find({ groupId, isSettled: false });
            let emailBalances = {};
            expenses.forEach(expense => {
                if (!emailBalances[expense.payerEmail]) emailBalances[expense.payerEmail] = 0;
                emailBalances[expense.payerEmail] += expense.amount;
                expense.splits.forEach(split => {
                    if (!emailBalances[split.email]) emailBalances[split.email] = 0;
                    emailBalances[split.email] -= split.amount;
                });
            });

            // 2. CHECK: Is the person confirming actually OWED money?
            const isOwedMoney = emailBalances[userEmail] > 0;
            const isOwner = group.adminEmail === userEmail;

            if (!isOwedMoney && !isOwner) {
                return response.status(403).json({
                    message: "Access Denied: Only members receiving funds can confirm this payment."
                });
            }

            // 3. Prevent self-confirmation
            if (memberEmail === userEmail && !isOwner) {
                return response.status(400).json({ message: "You cannot verify your own payment." });
            }

            await Group.updateOne(
                { _id: groupId, "members.email": memberEmail },
                { $set: { "members.$.settlementStatus": "confirmed" } }
            );

            response.status(200).json({ message: `Payment verified for ${memberEmail}` });
        } catch (error) {
            console.error("Approve Member Error:", error);
            response.status(500).json({ message: "Error approving settlement" });
        }
    },

    confirmSettlement: async (request, response) => {
        try {
            const { groupId } = request.body;
            const userEmail = request.user.email;

            const group = await Group.findById(groupId);
            if (!group) return response.status(404).json({ message: "Group not found" });

            const member = group.members.find(m => m.email === userEmail);
            const hasAdminRights =
                member?.role?.toLowerCase() === 'admin' ||
                group.adminEmail?.toLowerCase() === userEmail?.toLowerCase();

            if (!hasAdminRights) {
                return response.status(403).json({
                    message: "Access Denied: Only Admins can perform the final Group Closure."
                });
            }

            const settlementBatchId = new mongoose.Types.ObjectId();

            await Expense.updateMany(
                { groupId: groupId, isSettled: false },
                {
                    $set: {
                        isSettled: true,
                        settledBy: userEmail,
                        settlementBatchId: settlementBatchId,
                        settledAt: Date.now()
                    }
                }
            );

            await Group.findByIdAndUpdate(groupId, {
                paymentStatus: {
                    amount: 0,
                    isPaid: true,
                    isPendingApproval: false,
                    date: Date.now(),
                    requestedBy: null
                },
                $set: { "members.$[].settlementStatus": "none" }
            });

            response.status(200).json({ message: "Group closed and all expenses settled." });
        } catch (error) {
            console.error("Confirm Settlement Error:", error);
            response.status(500).json({ message: "Error confirming settlement" });
        }
    },

    reopenGroup: async (request, response) => {
        try {
            const { groupId } = request.body;
            const userEmail = request.user.email;

            const group = await Group.findById(groupId);
            if (!group) return response.status(404).json({ message: "Group not found" });

            const member = group.members.find(m => m.email === userEmail);
            const hasManagerRights =
                member?.role?.toLowerCase() === 'admin' ||
                member?.role?.toLowerCase() === 'manager' ||
                group.adminEmail === userEmail;

            if (!hasManagerRights) {
                return response.status(403).json({
                    message: "Access Denied: Only Admins or Managers can re-open groups."
                });
            }

            await Expense.updateMany(
                { groupId: groupId },
                { $set: { isSettled: false, settledBy: null, settledAt: null } }
            );

            await Group.findByIdAndUpdate(groupId, {
                paymentStatus: {
                    isPaid: false,
                    isPendingApproval: false,
                    requestedBy: null,
                    amount: 0,
                    date: null
                }
            });

            response.status(200).json({ message: "Group re-opened successfully" });
        } catch (error) {
            console.error("Reopen Group Error:", error);
            response.status(500).json({ message: "Error re-opening group" });
        }
    },

    getDashboardStats: async (request, response) => {
        try {
            const userEmail = request.user.email;
            const user = await User.findOne({ email: userEmail });
            const expenses = await Expense.find({
                $or: [{ payerEmail: userEmail }, { "splits.email": userEmail }]
            })
                .sort({ date: -1 })
                .limit(5)
                .populate('groupId', 'name');

            let totalPaid = 0;
            let totalOwed = 0;
            expenses.forEach(exp => {
                if (exp.payerEmail === userEmail && !exp.isSettled) {
                    const othersSplit = exp.splits.filter(s => s.email !== userEmail).reduce((sum, s) => sum + s.amount, 0);
                    totalPaid += othersSplit;
                } else if (exp.payerEmail !== userEmail && !exp.isSettled) {
                    const mySplit = exp.splits.find(s => s.email === userEmail);
                    if (mySplit) totalOwed += mySplit.amount;
                }
            });

            response.status(200).json({
                totalPaid,
                totalOwed,
                credits: user.credits,
                recentActivity: expenses
            });
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            response.status(500).json({ message: "Error calculating stats" });
        }
    }
};

module.exports = expenseController;