const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    category: {type: String, required: true},
    description: {type: String},
    amount: {type: Number, required: true},
    when: {type: Date, required: true, default: Date.now}
})

module.exports = mongoose.model('Expense', expenseSchema);