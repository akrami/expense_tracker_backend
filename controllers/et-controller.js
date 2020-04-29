const Expense = require('../models/expense');

exports.getExpenses = (req, res, next) => {
    Expense.find().sort({ when: -1 }).limit(20)
        .exec()
        .then(data => {
            res.json(data);
        });
}

exports.getTotal = (req, res, next) => {
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

exports.addExpense = (req, res, next) => {
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

exports.getCategories = (req, res, next) => {
    Expense.distinct("category").exec()
        .then(data => {
            res.json(data);
        });
}

exports.getCategorySum = (req, res, next) => {
    Expense.aggregate([{
        $group: {
            _id: "$category",
            total: { $sum: "$amount" }
        }
    }]).exec()
        .then(data => res.json(data));
}

exports.incomeCategories = (req, res, next) => {
    Expense.distinct("category", {
        amount: { $gt: 0 }
    }).exec()
        .then(data => {
            res.json(data);
        });
}

exports.expenseCategories = (req, res, next) => {
    Expense.distinct("category", {
        amount: { $lt: 0 }
    }).exec()
        .then(data => {
            res.json(data);
        });
}

exports.last30Days = (req, res, next) => {
    let now = new Date();
    let aimDate = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    aimDate.setDate(aimDate.getDate() - 30);
    aimDate.setHours(0);
    aimDate.setMinutes(0);
    aimDate.setSeconds(0);
    aimDate.setMilliseconds(0);

    const timeDiff = (now - aimDate) / 86400000;

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
                        in: { min: { $add: [aimDate, { $multiply: ["$$mlt", 86400000] }] }, max: { $add: [aimDate, { $multiply: [{ $add: ["$$mlt", 1] }, 86400000] }] } }
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
                        $cond: [{ $and: [{ $gte: ["$when", "$dateRange.min"] }, { $lt: ["$when", "$dateRange.max"] }] }, "$amount", 0]
                    }
                }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { "date": "$_id.min", "total": 1, "_id": 0 } }
    ]).exec()
        .then(data => res.json(data))
        .catch(error => console.error(error));
}

exports.topCategories = (req, res, next) => {
    const aimDate = new Date();
    aimDate.setDate(aimDate.getDate() - 30);

    Expense.aggregate([
        { $match: { "when": { $gte: aimDate } } },
        {
            $group:
            {
                _id: "$category",
                income: {
                    $sum: {
                        $cond: [
                            { $gt: ["$amount", 0] },
                            "$amount",
                            0
                        ]
                    }
                },
                expense: {
                    $sum: {
                        $cond: [
                            { $lt: ["$amount", 0] },
                            "$amount",
                            0
                        ]
                    }
                }
            }

        },
        { $sort: { "expense": 1 } }
    ]).limit(5).exec()
        .then(result => res.json(result));
}

exports.getMonth = (req, res, next) => {
    const { month, year } = req.params;
    const startDate = new Date(year, month, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 1, 0, 0, 0, 0);
    endDate.setMonth(endDate.getMonth() + 1);

    Expense.aggregate([
        { $match: { "when": { $gte: startDate, $lte: endDate } } },
        {
            $addFields: {
                dateRange: {
                    $map: {
                        input: {
                            $range: [0, Math.ceil((endDate - startDate) / 86400000)]
                        },
                        as: "mlt",
                        in: { min: { $add: [startDate, { $multiply: ["$$mlt", 86400000] }] }, max: { $add: [startDate, { $multiply: [{ $add: ["$$mlt", 1] }, 86400000] }] } }
                    }
                }
            }
        },
        { $unwind: "$dateRange" },
        {
            $group: {
                _id: "$dateRange",
                income: {
                    $sum: {
                        $cond: [{ $and: [{ $and: [{ $gte: ["$when", "$dateRange.min"] }, { $lt: ["$when", "$dateRange.max"] }] }, { $gte: ["$amount", 0] }] }, "$amount", 0]
                    }
                },
                expense: {
                    $sum: {
                        $cond: [{ $and: [{ $and: [{ $gte: ["$when", "$dateRange.min"] }, { $lt: ["$when", "$dateRange.max"] }] }, { $lt: ["$amount", 0] }] }, "$amount", 0]
                    }
                }
            }
        },
        { $sort: { "_id": 1 } },
        { $project: { "date": "$_id.min", "income": 1, "expense": 1, "_id": 0 } }
    ]).exec()
        .then(result => res.json(result));
}

exports.getWeek = (req, res, next) => {
    const { day, month, year } = req.params;
    const tempDate = new Date(year, month, day, 0, 0, 0, 0);
    const startDate = new Date(year, month, tempDate.getDate() - tempDate.getDay(), 0, 0, 0, 0);
    const endDate = new Date(year, month, tempDate.getDate() + 6 - tempDate.getDay(), 0, 0, 0, 0);

    Expense.aggregate([
        { $match: { "when": { $gte: startDate, $lte: endDate } } },
        {
            $addFields: {
                dateRange: {
                    $map: {
                        input: {
                            $range: [0, Math.ceil((endDate - startDate) / 3600000)]
                        },
                        as: "mlt",
                        in: { min: { $add: [startDate, { $multiply: ["$$mlt", 3600000] }] }, max: { $add: [startDate, { $multiply: [{ $add: ["$$mlt", 1] }, 3600000] }] } }
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
                        $cond: [{ $and: [{ $gte: ["$when", "$dateRange.min"] }, { $lt: ["$when", "$dateRange.max"] }] }, "$amount", 0]
                    }
                }
            }
        },
        { $sort: { "_id": 1 } },
        { $project: { "date": "$_id.min", "total": 1, "_id": 0 } },
        { $match: { "total": { $ne: 0 } } }
    ]).exec()
        .then(result => res.json(result));
}

exports.getDay = (req, res, result) => {
    const { day, month, year } = req.params;
    const theDay = new Date(year, month, day, 0, 0, 0, 0);
    const nextDay = new Date(year, month, theDay.getDate() + 1, 0, 0, 0, 0);

    Expense.find({
        "when": { $gte: theDay, $lt: nextDay }
    }).exec()
        .then(result => res.json(result));
}

exports.removeExpense = (req, res, next) => {
    const { id } = req.params;

    Expense.deleteOne({ _id: id }).exec().then(() => res.json({ status: 1 }));
}