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
    }
};

module.exports = expenseController;