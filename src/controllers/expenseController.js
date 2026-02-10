const mongoose = require('mongoose'); 
const Expense = require('../model/expense');
const Group = require('../model/group');
const User = require('../model/users'); // Ensure this matches your filename in /model/

const expenseController = {
    addExpense: async (request, response) => {
        try {
            const { groupId, description, amount, payerEmail, splits } = request.body;

            const totalSplit = splits.reduce((acc, curr) => acc + curr.amount, 0);
            if (Math.abs(totalSplit - amount) > 0.1) {
                return response.status(400).json({ message: "Split amounts do not match total" });
            }

            const newExpense = new Expense({ groupId, description, amount, payerEmail, splits });
            await newExpense.save();

            response.status(201).json({ message: "Expense added", expense: newExpense });
        } catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    getGroupExpenses: async (request, response) => {
        try {
            const { groupId } = request.params;
            const expenses = await Expense.find({ groupId }).sort({ date: -1 });

            // ENRICHMENT: Fetch names for Recent Activity
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

            // ENRICHMENT: Fetch names for Net Balances
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

    requestSettlement: async (request, response) => {
        try {
            const { groupId } = request.body;
            const requesterEmail = request.user.email;

            // Mark the group as awaiting admin confirmation
            await Group.findByIdAndUpdate(groupId, {
                'paymentStatus.isPendingApproval': true,
                'paymentStatus.requestedBy': requesterEmail
            });

            response.status(200).json({ message: "Settlement request sent to Admin" });
        } catch (error) {
            response.status(500).json({ message: "Error requesting settlement" });
        }
    },

    // 2. Admin calls this after verifying the money was received
    // Inside expenseController.js
    confirmSettlement: async (request, response) => {
        try {
            const { groupId } = request.body;
            const group = await Group.findById(groupId);
            const settlementBatchId = new mongoose.Types.ObjectId(); // Unique ID for this specific settlement event

            // Update expenses to include the batch ID and who settled them
            await Expense.updateMany(
                { groupId: groupId, isSettled: false },
                {
                    $set: {
                        isSettled: true,
                        settledBy: group.paymentStatus.requestedBy,
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
                    date: Date.now()
                }
            });
            response.status(200).json({ message: "Settlement confirmed" });
        } catch (error) {
            response.status(500).json({ message: "Error confirming settlement" });
        }
    },
    // src/controllers/expenseController.js

    reopenGroup: async (request, response) => {
        try {
            const { groupId } = request.body;

            // 1. Reset all expenses in this group to unsettled
            await Expense.updateMany(
                { groupId: groupId },
                { $set: { isSettled: false, settledBy: null, settledAt: null } }
            );

            // 2. Reset Group status to Active
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
            response.status(500).json({ message: "Error re-opening group" });
        }
    }
};

module.exports = expenseController;