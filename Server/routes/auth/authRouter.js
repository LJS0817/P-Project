const express = require('express');
const router = express.Router();

router.get('/signin', (req, res) => {
    res.render('auth/sign', {authForm:'../../views/auth/signin.ejs'}, (e, content) => {
        res.end(content);
    });
});

router.post('/signin', (req, res) => {
    return res.status(400).json({
        success: false,
        reason: ['id', 'pwd']
    });
});


router.get('/signup', (req, res) => {
    res.render('auth/sign', {authForm:'../../views/auth/signup'}, (e, content) => {
        res.end(content);
    });
});

router.post('/create', (req, res) => {
    res.render('auth/sign', {authForm:'../../views/auth/signin.ejs'}, (e, content) => {
        res.end(content);
    });
});


module.exports = router;