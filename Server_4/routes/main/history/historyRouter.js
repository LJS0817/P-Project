const express = require('express');
const router = express.Router();
const { getUserContext } = require('../sidebarUtil');
const db = require('../../../config/db');

router.get('/', async (req, res) => {
    // 로그인 체크
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }

    const userId = req.session.user.id;

    try {
        // DB에서 히스토리 조회
        // (사용자의 프로젝트 + 이미지 + 분석결과를 조인)
        const sql = `
            SELECT 
                p.title AS project_name,
                i.original_name AS page_name,
                ar.created_at AS analyzed_at
            FROM analysis_results ar
            JOIN images i ON ar.image_id = i.id
            JOIN projects p ON i.project_id = p.id
            WHERE p.user_id = ? 
            AND p.is_deleted = 0 
            AND i.is_deleted = 0
            ORDER BY ar.created_at DESC
        `;

        const rows = await db.query(sql, [userId]);

        //데이터가 하나도 없으면 -> emptyProject 렌더링
        // if (rows.length === 0) {
        //     return res.render('main/index', getUserContext({
        //         content: "./project/emptyProject.ejs",
        //         title: "Histories",
        //         subtitle: `No history found`,
        //         flag: "add" 
        //     }), (err, html) => {
        //         if (err) console.error('렌더링 에러', err);
        //         res.end(html);
        //     });
        // }

        // 데이터가 있으면 -> 포맷팅 후 history 렌더링
        const hist = rows.map(row => ({
            date: new Date(row.analyzed_at).toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            }).replace(/\./g, ' .').replace(/:/g, ' : '), 
            project: row.project_name,
            page: row.page_name
        }));

        return res.render('main/index', 
            getUserContext({
                content: "./history/history.ejs", 
                title: "Histories", 
                subtitle: "Showing all your analysis histories", 
                history: hist
            }), (e, content) => {
            if (e) console.error(e);
            res.end(content);
        });

    } catch (err) {
        console.error('히스토리 라우터 에러', err);
        res.status(500).send('DB 에러 발생');
    }
});

module.exports = router;