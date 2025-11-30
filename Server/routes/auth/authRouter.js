const express = require('express');
const router = express.Router();

// 로그인 페이지 라우트 /signin
router.get('/signin', (req, res) => {
    res.render('auth/sign', {authForm:'../../views/auth/signin.ejs'}, (e, content) => {
        res.end(content);
    });
});

// 회원가입 페이지 라우트 /signup
router.get('/signup', (req, res) => {
    res.render('auth/sign', {authForm:'../../views/auth/signup'}, (e, content) => {
        res.end(content);
    });
});

module.exports = router;