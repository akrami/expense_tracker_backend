const express = require('express');
const { getExpenses, addExpense, incomeCategories, expenseCategories, getTotal, getCategorySum, getCategories, last30Days } = require('../controllers/et-controller');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', addExpense);
router.get('/total', getTotal);
router.get('/categories', getCategories);
router.get('/categories/total', getCategorySum);
router.get('/categories/income', incomeCategories);
router.get('/categories/expense', expenseCategories);
router.get('/data/last30days', last30Days);

module.exports = router;