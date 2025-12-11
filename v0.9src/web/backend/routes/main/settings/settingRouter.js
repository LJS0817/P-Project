const express = require('express');
const router = express.Router();
const db = require('../../../config/db'); // DB 연결 추가
const { getUserContext } = require('../sidebarUtil')


router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }
    // console.log(req.session.user)
    res.render('main/index', getUserContext(req,{content:"./settings/settings.ejs", title:"settingTitle", subtitle:"settingSubtitle", which:"account", index: 0}), (e, content) => {
        console.log(e);
        res.end(content);
    });
});

router.get('/preferences', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }
    res.render('main/index', getUserContext(req,{content:"./settings/settings.ejs", title:"settingTitle", subtitle:"settingSubtitle", which:"prefer", index: 1}), (e, content) => {
        res.end(content);
    });
});

router.get('/project', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }
    res.render('main/index', getUserContext(req,{content:"./settings/settings.ejs", title:"settingTitle", subtitle:"settingSubtitle", which:"project", index: 2}), (e, content) => {
        res.end(content);
    });
});


// 설정 업데이트 처리 라우트 /dashboard/settings/update
router.post('/update', async (req, res) => {
    // 설정 업데이트 처리 로직 작성
    if (!req.session.user) {
        return res.redirect('/auth');
    }
    const userId = req.session.user.id;
    const { dateFormat, theme } = req.body;

    try {
        // DB 업데이트 쿼리
        await db.query(`UPDATE user_settings SET date_format = ?, theme = ? WHERE user_id =?`,
            [dateFormat, theme, userId]);
       
        // 세션 정보도 업데이트 (새로고침 없이 반영)
        req.session.user.date_format = dateFormat;
        req.session.user.theme = theme;

        req.session.save(() => {
            res.send({ success: true, message: '설정 업데이트' });
        });
    } catch (err) {
        console.error('설정 업데이트 에러', err);
        res.status(500).send({ success: false, message: err });
    };
});



// 회원 정보 수정
router.post('/update-account', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth');

    const userId = req.session.user.id;
    const { nickname, email } = req.body;

    try {
        // DB 업데이트
        await db.query(`UPDATE users SET nickname = ?, email = ? WHERE id = ?`, [nickname, email, userId]);

        // 세션 정보도 업데이트
        req.session.user.nickname = nickname;
        req.session.user.email = email;

        req.session.save(() => {
            res.send({ success: true });
        });
    } catch (err) {
        console.error('에러', err);
        res.status(500).json({ success: false, message: err });
    }
});


// -> 회원 관련 js를 settings/account.js에 추가
// 회원 탈퇴
router.post('/delete-account', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: '너 로그인 안되어있어'});

    const userId = req.session.user.id;

    try {
        // 외래키 제약조건 -> 순서대로 해야함
        // 설정 데이터 삭제
        await db.query(`DELETE FROM user_settings WHERE user_id = ?`, [userId]);

        // 사용자 데이터 삭제
        await db.query(`DELETE FROM users WHERE id =?`, [userId]);

        // 세션 파기 밎 로그아웃
        req.session.destroy(() => {
            res.json({ success: true});
        });
    } catch (err) {
        console.error('삭제 에러', err);
        res.status(500).json({ success: false, message: 'DB가 아퍼'});
    }
});


module.exports = router;