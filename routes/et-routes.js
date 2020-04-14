const express = require('express');
const { getExpenses, addExpense } = require('../controllers/et-controller');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', addExpense);

module.exports = router;