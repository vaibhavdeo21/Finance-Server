const Expense = require('../model/expense');
const Group = require('../model/group');

const expenseController = {
    addExpense: async (request, response) => {
        try {
            const { groupId, description, amount, payerEmail, splits } = request.body;

            // Validates that the sum of custom splits matches the total amount
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
            response.status(200).json(expenses);
        } catch (error) {
            response.status(500).json({ message: "Error fetching expenses" });
        }
    },

    // src/controllers/expenseController.js
getGroupSummary: async (request, response) => {
    try {
        const { groupId } = request.params;
        const [expenses, group] = await Promise.all([
            Expense.find({ groupId, isSettled: false }),
            Group.findById(groupId)
        ]);

        // Map emails to names from the group/user data for the frontend
        const userMap = {}; // You can fetch names from the Users collection if needed
        
        let balances = {};
        expenses.forEach(expense => {
            if (!balances[expense.payerEmail]) balances[expense.payerEmail] = 0;
            balances[expense.payerEmail] += expense.amount;

            expense.splits.forEach(split => {
                if (!balances[split.email]) balances[split.email] = 0;
                balances[split.email] -= split.amount;
            });
        });

        // Optional: Convert email keys to object containing { name, amount } 
        // by looking up names in your database.
        response.status(200).json({ balances });
    } catch (error) {
        response.status(500).json({ message: "Error calculating summary" });
    }
},

    settleGroup: async (request, response) => {
        try {
            const { groupId } = request.body;

            // Mark all expenses in this group as settled
            await Expense.updateMany(
                { groupId: groupId, isSettled: false },
                { $set: { isSettled: true } }
            );

            // Update Group status to paid/settled
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
    }
};

module.exports = expenseController;