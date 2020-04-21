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
    now.setUTCHours(0);
    now.setUTCMinutes(0);
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);
    aimDate.setDate(aimDate.getDate() - 30);
    aimDate.setUTCHours(0);
    aimDate.setUTCMinutes(0);
    aimDate.setUTCSeconds(0);
    aimDate.setUTCMilliseconds(0);

    const timeDiff = (now - aimDate)/86400000;

    Expense.aggregate([
        { $match: { "when": { $gte: aimDate, $lte: now } } },
        {
            $addFields: {
                when: {
                    $dateFromParts: { year: { $year: "$when" }, month: { $month: "$when" }, day: { $dayOfMonth: "$when" } }
                },
                dateRange: {
                    $map: {
                        input: {
                            $range: [0, timeDiff]
                        },
                        as: "mlt",
                        in: {$add:[aimDate, {$multiply:["$$mlt",86400000]}]}
                    }
                }
            }
        },
        { $unwind: "$dateRange" },
        {
            $group: {
                _id: "$dateRange",
                count: {
                    $sum: {
                        $cond: [{ $eq: ["$dateRange", "$when"] }, "$amount", 0]
                    }
                }
            }
        },
        { $sort: { _id: 1 } }
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