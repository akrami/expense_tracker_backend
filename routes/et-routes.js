const express = require('express');
const { getExpenses, addExpense, incomeCategories, expenseCategories, getTotal } = require('../controllers/et-controller');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', addExpense);
router.get('/total', getTotal);
router.get('/categories/income', incomeCategories);
router.get('/categories/expense', expenseCategories);

module.exports = router;