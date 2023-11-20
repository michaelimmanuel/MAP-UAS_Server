const express = require('express');
const router = express.Router();
const loginController = require('../controller/loginController');


router.post('/login', (req, res) => {
    loginController.login(req, res);

    
});


router.post('/register', (req, res) => {
    loginController.register(req, res);
});

module.exports = router;
