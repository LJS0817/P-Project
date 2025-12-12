// routes/auth/router.js

const express = require('express');
const router = express.Router();

// 로그인 화면 (GET)
router.get('/signin', (req, res) => {
    res.render('auth/signin');
});

// 로그인 데이터 처리 (POST)
router.post('/signin', (req, res) => {
    // 폼에서 보낸 데이터 받기
    const { username, password } = req.body;

    
    // admin 1234 // 테스트용 아이디/비번
    if (username === 'admin' && password === '1234') {
        console.log('로그인 성공!');
        
        // 대시보드 페이지로 이동 
        res.redirect('/main/index'); 
    } else {
        console.log('로그인 실패');
        // 실패 시 알림을 띄우고 다시 로그인창으로
        res.send(`<script>alert('아이디 또는 비밀번호 틀림.'); location.href='/auth/signin';</script>`);
    }
});

// 회원가입 라우트 등 나머지 코드 작성 필요

module.exports = router;