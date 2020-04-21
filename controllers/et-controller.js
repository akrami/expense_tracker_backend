const Expense = require('../models/expense');

const getExpenses = (req, res, next) => {
    Expense.find().sort({ when: -1 })
        .exec()
        .then(data => {
            res.json(data);
        });
}

const getTotal = (req, res, next) => {
    Expense.aggregate([{
        $group: {
            _id: null,
            total: { $sum: "$amount" }
        }
    }]).exec()
        .then(data => {
            res.json(data);
        });
}

const addExpense = (req, res, next) => {
    const { category, description, amount, when } = req.body;

    const expense = new Expense({ category, description, amount, when })

    expense.save()
        .then(() => {
            res.json({
                status: 1
            });
        })
        .catch(error => {
            res.json({
                status: 0,
                error
            });
        });
}

const incomeCategories = (req, res, next) => {
    Expense.distinct("category", {
        amount: { $gt: 0 }
    }).exec()
        .then(data => {
            res.json(data);
        });
}

const expenseCategories = (req, res, next) => {
    Expense.distinct("category", {
        amount: { $lt: 0 }
    }).exec()
        .then(data => {
            res.json(data);
        });
}

exports.getExpenses = getExpenses;
exports.getTotal = getTotal;
exports.addExpense = addExpense;
exports.incomeCategories = incomeCategories;
exports.expenseCategories = expenseCategories;