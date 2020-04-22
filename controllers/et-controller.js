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

const getCategories = (req, res, next) => {
    Expense.distinct("category").exec()
        .then(data => {
            res.json(data);
        });
}

const getCategorySum = (req, res, next) => {
    Expense.aggregate([{
        $group: {
            _id: "$category",
            total: { $sum: "$amount" }
        }
    }]).exec()
        .then(data => res.json(data));
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

const last30Days = (req, res, next) => {
    let now = new Date();
    let aimDate = new Date(); 
    now.setDate(now.getDate()+1);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    aimDate.setDate(aimDate.getDate() - 30);
    aimDate.setHours(0);
    aimDate.setMinutes(0);
    aimDate.setSeconds(0);
    aimDate.setMilliseconds(0);

    const timeDiff = (now - aimDate)/86400000;

    Expense.aggregate([
        { $match: { "when": { $gte: aimDate, $lte: now } } },
        {
            $addFields: {
                dateRange: {
                    $map: {
                        input: {
                            $range: [0, timeDiff]
                        },
                        as: "mlt",
                        in: {min:{$add:[aimDate, {$multiply:["$$mlt",86400000]}]}, max: {$add:[aimDate, {$multiply:[{$add:["$$mlt",1]},86400000]}]}}
                    }
                }
            }
        },
        { $unwind: "$dateRange" },
        {
            $group: {
                _id: "$dateRange",
                total: {
                    $sum: {
                        $cond: [{ $and: [ { $gte: [ "$when", "$dateRange.min" ] }, { $lt: [ "$when", "$dateRange.max" ] } ] }, "$amount", 0]
                    }
                }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { "date":"$_id.min", "total":1, "_id":0}}
    ]).exec()
        .then(data => res.json(data))
        .catch(error=>console.error(error));
}

exports.getExpenses = getExpenses;
exports.getTotal = getTotal;
exports.addExpense = addExpense;
exports.getCategories = getCategories;
exports.getCategorySum = getCategorySum;
exports.incomeCategories = incomeCategories;
exports.expenseCategories = expenseCategories;
exports.last30Days = last30Days;