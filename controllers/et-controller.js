const Expense = require('../models/expense');

const getExpenses = (req, res, next) => {
    Expense.find()
    .exec()
    .then(data=>{
        res.json(data);
    });
}

const addExpense = (req, res, next) => {
    const { category, description, amount, when } = req.body;
    
    const expense = new Expense({ category, description, amount, when})
    
    expense.save()
    .then(()=>{
        res.json({
            status: 1
        });
    })
    .catch(error=>{
        res.json({
            status: 0,
            error
        });
    });
}

exports.getExpenses = getExpenses;
exports.addExpense = addExpense;