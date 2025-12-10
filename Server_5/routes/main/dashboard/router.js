const express = require('express');
const router = express.Router();
const { getUserContext } = require('../sidebarUtil')

const db = require('../../../config/db');

router.get('/', async (req, res) => {
    // 로그인 확인
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }

    const userId = req.session.user.id;
    const userNickname = req.session.user.nickname;

    try {
        // DB에서 내 프로젝트 조회
        const sql = `
        SELECT id, title, description, thumb_path, updated_at
        FROM projects
        WHERE user_id = ? AND is_deleted = 0
        ORDER BY updated_at DESC
        LIMIT 3`;
    
        const rows = await db.query(sql, [userId]);

        // 프로젝트가 하나도 없으면 emptyProject.ejs 렌더링
        if (rows.length === 0) {
            return res.render('main/index', getUserContext({
                content: "./project/emptyProject.ejs",
                title: "Project",
                subtitle: `It's empty`,
                flag: "add"
            }), (err, html) => {
                if (err) console.error('렌더링 에러', err);
                res.end(html);
            });
        }

        const historySql = `
            SELECT i.id AS img_id, p.id AS project_id, p.title, i.created_at, ar.heatmap_path
            FROM images i
            JOIN projects p ON i.project_id = p.id
            JOIN analysis_results ar ON i.id = ar.image_id
            WHERE p.user_id = ? 
            AND i.is_deleted = 0 
            AND p.is_deleted = 0
            AND ar.heatmap_path IS NOT NULL
            AND ar.heatmap_path != ''
            ORDER BY i.created_at DESC
            LIMIT 4`;

        const historyRows = await db.query(historySql, [userId]);

        const hist = historyRows.map(row => ({
            pid: row.project_id,
            id: row.img_id,
            name: row.title,
            when: new Date(row.created_at).toLocaleDateString(),
            image: row.heatmap_path 
        }));

        // 프로젝트가 있으면 기존대로 dashboard.ejs 렌더링
        const cards = rows.map(row => ({
            id: row.id,
            title: row.title,
            author: userNickname,
            updated: new Date(row.updated_at).toLocaleDateString(),
            thumb: row.thumb_path ? row.thumb_path : '/images/default_thumb.png' 
        }));


        res.render('main/index', getUserContext({
            content: "./dashboard/dashboard.ejs",
            title: "Dashboard",
            subtitle: `Welcome, ${userNickname}`,
            cards: cards,
            histories: hist 
        }), (err, html) => {
            if (err) console.error('렌더링 에러', err);
            res.end(html);
        });
    } catch (err) {
        console.error('대시보드 조회 에러', err);
        res.status(500).send('서버 에러');
    }
})

// router.get('/', (req, res) => {
//     const cards = [
//         {id:"1", title:"Test 123", author:"opq", updated:"2025.11.11", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
//         {id:"2", title:"1234153", author:"sadf", updated:"2023.11.21", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
//         {id:"3", title:"abcde", author:"1234", updated:"2015.11.31", thumb:"https://i.namu.wiki/i/ixg5gFp_6YwLhEIW0MGFwalhiU5_WDERVuRvGHRTV3dwm3qWsTHmOCbsCUBAVkaOHRe8qtH9ru-Yf0p0zOO9G4dnH5lnLKAbVQQ53BcrFnC_n3gcCI_iilFSsCJj1Tm9EW10iJdoZZYaQi2K2RUkqg.webp"},
//     ]
//     const hist = [
//         {pid:"1", id:"1", name:"Test 123", when:"2025.11.11"},
//         {pid:"1", id:"2", name:"1234153", when:"2023.11.21"},
//         {pid:"1", id:"3", name:"abcde", when:"2015.11.31"},
//         {pid:"1", id:"3", name:"abcde", when:"2015.11.31"},
//     ]
//     res.render('main/index', 
//         { content:"./dashboard/dashboard.ejs", 
//             title:"Dashboard", 
//             subtitle:"Welcome Username", 
//             cards:cards, histories:hist }, (e, content) => {
//         res.end(content);
//     });

//     // 에러 해결용 임시 주석
//     // res.render('main/index', {
//     //     content: "./dashboard/dashboard.ejs",
//     //     title: "Dashboard",
//     //     subtitle: "Welcome",
//     //     cards: cards,
//     //     histories: hist
//     // }); 
// });

module.exports = router;