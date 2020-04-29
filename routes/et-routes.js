const express = require('express');
const { getExpenses, addExpense, incomeCategories, expenseCategories, getTotal, getCategorySum, getCategories, last30Days, topCategories, getMonth, getWeek, getDay, removeExpense } = require('../controllers/et-controller');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', addExpense);
router.get('/total', getTotal);
router.get('/categories', getCategories);
router.get('/categories/total', getCategorySum);
router.get('/categories/income', incomeCategories);
router.get('/categories/expense', expenseCategories);
router.get('/data/last30days', last30Days);
router.get('/data/top-categories', topCategories);
router.get('/month/:year/:month', getMonth);
router.get('/week/:year/:month/:day', getWeek);
router.get('/day/:year/:month/:day', getDay);
router.delete('/:id', removeExpense);

module.exports = router;