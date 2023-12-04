const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');


router.post('/users/:id/spending', (req, res) => {
    transactionController.createSpending(req, res);
});

router.get('/users/:id/spending/day', (req, res) => {
    transactionController.getSpendingByDay(req, res);
});

router.get('/users/:id/spending/month', (req, res) => {
    transactionController.getSpendingByMonth(req, res);
});

module.exports = router;