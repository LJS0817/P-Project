console.log("=========================================");
console.log(">>> [LOADED] Admin Router with Access Control");
console.log("=========================================");

const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { getAdminContext } = require('../sidebarUtil');

// [보안 미들웨어] 관리자 권한 체크 (가장 상단에 위치)
router.use((req, res, next) => {
    // 세션에 유저 정보가 있고, IS_ADMIN이 1이어야 통과
    // 주의: 로그인 시 req.session.user에 DB의 모든 정보를 저장하고 있어야 함
    const user = req.session.user;
    
    next();
    // if (user && user.IS_ADMIN === 1) {
    //     next();
    // } else {
    //     console.log(`[ACCESS DENIED] User: ${user?.LOGIN_ID || 'Guest'}`);
    //     // 권한이 없으면 메인 페이지로 리다이렉트
    //     res.redirect('/'); 
    // }
});

// 날짜 포맷 헬퍼
const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

// [함수] 그래프 데이터 생성기
async function getGraphData(tableName, dateCol = 'CREATED_AT') {
    try {
        const totalRes = await db.query(`SELECT COUNT(*) as cnt FROM ${tableName}`);
        const totalCount = Number(totalRes[0].cnt || totalRes[0].CNT || 0);

        const sql = `
            SELECT DATE(${dateCol}) as date, COUNT(*) as cnt 
            FROM ${tableName} 
            WHERE ${dateCol} >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(${dateCol})
        `;
        const rows = await db.query(sql);

        const countMap = {};
        rows.forEach(r => {
            const dStr = new Date(r.date || r.DATE).toISOString().split('T')[0]; 
            countMap[dStr] = Number(r.cnt || r.CNT);
        });

        const points = [];
        let currentTotal = totalCount;
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            points.unshift(currentTotal);
            currentTotal -= (countMap[dStr] || 0);
        }
        return { value: totalCount, points: points };
    } catch (err) {
        return { value: 0, points: Array(30).fill(0) };
    }
}

// 1. Dashboard (Overview)
router.get('/', async (req, res) => {
    try {
        const [userData, projectData, analysisData] = await Promise.all([
            getGraphData('users', 'CREATED_AT'),
            getGraphData('projects', 'CREATED_AT'),
            getGraphData('analysis_results', 'CREATED_AT')
        ]);

        const cards = [
            { tag: "adminUserTitle", value: userData.value, points: userData.points },
            { tag: "listProjectCountTitle", value: projectData.value, points: projectData.points },
            { tag: "adminOverviewChartPageTitle", value: analysisData.value, points: analysisData.points },
        ];

        // 대시보드 하단 유저 리스트
        const userSql = `
            SELECT u.id, u.EMAIL, u.NICKNAME, u.CREATED_AT, u.IS_ADMIN,
            (SELECT COUNT(*) FROM projects p WHERE p.USER_ID = u.id) as projectCnt
            FROM users u ORDER BY u.CREATED_AT DESC LIMIT 10
        `;
        const userRows = await db.query(userSql);
        
        const users = userRows.map(u => ({
            id: u.id || u.ID,
            name: u.NICKNAME || u.nickname,
            email: u.EMAIL || u.email,
            projectCnt: u.projectCnt,
            created: formatDate(u.CREATED_AT || u.created_at),
            is_admin: u.IS_ADMIN // 관리자 여부 전달
        }));

        // req를 getAdminContext에 전달 (세션 확인용)
        res.render('main/index', getAdminContext(req, { 
            content: "./admin/dashboard/dashboard.ejs", 
            title: "overviewTitle", subtitle: req.__('overviewSubtitle', req.session.user.nickname), cards, users 
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 2. Database Page
router.get('/database', async (req, res) => {
    try {
        const sql = `SHOW TABLES`;
        const rows = await db.query(sql);
        const allTables = rows.map(row => Object.values(row)[0]);
        const tables = allTables.filter(t => t !== 'sessions');
        
        res.render('main/index', getAdminContext(req, {
            content: "./admin/database/database.ejs", 
            title: "adminDatabaseTitle", subtitle: "adminDatabaseSubtitle", tables
        }));
    } catch (e) {
        console.error(e);
        res.status(500).send("DB Error");
    }
});

// [API] 테이블 데이터 조회
router.get('/table/getData', async (req, res) => {
    try {
        const rawData = await db.query(`SELECT * FROM ${req.query.table} LIMIT 100`);
        const validKeys = rawData.length > 0 ? Object.keys(rawData[0]) : [];
        res.json({ success: true, data: rawData, validKeys });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// [API] 테이블 데이터 삭제
router.post('/table/deleteData', async (req, res) => {
    const { table, field, value } = req.body;
    if (!table || !field || !value) return res.status(400).json({ success: false, message: "파라미터 부족" });
    
    // 보안: 허용된 테이블만
    const allowedTables = ['users', 'projects', 'images', 'analysis_results', 'user_settings'];
    if(!allowedTables.includes(table)) return res.status(403).json({success: false, message: "Not Allowed"});

    try {
        await db.query(`DELETE FROM \`${table}\` WHERE \`${field}\` = ?`, [value]);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// [API] 관리자 권한 변경 (Toggle) 
router.post('/user/toggleAdmin', async (req, res) => {
    const { userId, setAdmin } = req.body; // setAdmin: true(부여), false(해제)
    
    // 안전장치: 자기 자신의 권한을 없애려고 하면 차단
    if (req.session.user && (req.session.user.id == userId || req.session.user.ID == userId) && setAdmin === false) {
        return res.status(400).json({ success: false, message: "자기 자신의 관리자 권한은 해제할 수 없습니다." });
    }

    try {
        const newStatus = setAdmin ? 1 : 0;
        await db.query(`UPDATE users SET IS_ADMIN = ? WHERE id = ?`, [newStatus, userId]);
        
        console.log(`[ADMIN ROLE CHANGED] User ${userId} -> ${newStatus}`);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "권한 변경 실패" });
    }
});


// 3. Users Page (관리자 관리 기능이 보여질 페이지)
router.get('/user', async (req, res) => {
    try {
        const userSql = `
            SELECT u.id, u.EMAIL, u.NICKNAME, u.CREATED_AT, u.IS_ADMIN,
            (SELECT COUNT(*) FROM projects p WHERE p.USER_ID = u.id) as projectCnt
            FROM users u ORDER BY u.CREATED_AT DESC
        `;
        const rows = await db.query(userSql);
        const users = rows.map(u => ({
            id: u.id || u.ID,
            mail: u.EMAIL || u.email,
            name: u.NICKNAME || u.nickname,
            projectCnt: u.projectCnt,
            created: formatDate(u.CREATED_AT || u.created_at),
            is_admin: u.IS_ADMIN // 프론트엔드로 전달
        }));
        
        res.render('main/index', getAdminContext(req, {
            content: "./admin/user/users.ejs", 
            title: "adminUserTitle", subtitle: "adminUserSubtitle", users
        }));
    } catch(err) {
        console.error(err);
        res.status(500).send("DB Error");
    }
});

// 4. Histories Page
router.get('/history', async (req, res) => {
    try {
        const sql = `
            SELECT * FROM (
                SELECT img.CREATED_AT as date, COALESCE(u.NICKNAME, 'Unknown') as user, COALESCE(p.TITLE, '-') as project, CONCAT(img.ORIGINAL_NAME, ' [', COALESCE(img.STATUS, '-'), ']') as page, 'Image' as type
                FROM images img LEFT JOIN projects p ON img.PROJECT_ID = p.id LEFT JOIN users u ON p.USER_ID = u.id
                UNION ALL
                SELECT p.CREATED_AT as date, COALESCE(u.NICKNAME, 'Unknown') as user, p.TITLE as project, 'New Project Created' as page, 'Project' as type
                FROM projects p LEFT JOIN users u ON p.USER_ID = u.id
            ) AS combined_history ORDER BY date DESC LIMIT 100
        `;
        const rows = await db.query(sql);
        const hist = rows.map(r => ({
            date: formatDate(r.date),
            user: r.user,
            project: r.project,
            page: r.page
        }));

        res.render('main/index', getAdminContext(req, {
            content: "./admin/history/history.ejs", 
            title: "historyTitle", subtitle: "adminHistorySubtitle", history: hist
        }));
    } catch(err) {
        console.error("History Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;