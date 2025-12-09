const express = require('express');
const router = express.Router();
const {getAdminContext} = require('../sidebarUtil')

router.get('/', (req, res) => {
    // 현재 날짜 기준 -30일 누적으로
    // [ -30, -29, -28 ... 0 ]
    /*
        SET @start_date = DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH);

        WITH RECURSIVE date_range AS (
            -- 1. 날짜 리스트 생성 (시작일 ~ 오늘)
            SELECT @start_date AS date
            UNION ALL
            SELECT date + INTERVAL 1 DAY
            FROM date_range
            WHERE date < CURRENT_DATE
        ),
        base_total AS (
            -- 2. 시작일 '이전'까지의 총 유저 수 미리 계산 (그래프 시작점)
            SELECT COUNT(*) as count FROM users WHERE created_at < @start_date
        )

        SELECT 
            d.date,
            -- [핵심] (기준점 이전 전체 유저) + (현재 행까지의 신규 유저 누적 합)
            (SELECT count FROM base_total) + 
            SUM(COUNT(u.id)) OVER (ORDER BY d.date) AS total_user_count
        FROM date_range d
        LEFT JOIN users u 
            ON DATE(u.created_at) = d.date
        GROUP BY d.date
        ORDER BY d.date;
    */
    const cards = [
        {tag:"Users", value:"30", points:[0, 0, 1, 2, 2, 3, 10, 21, 21, 30, 30, 30, 41, 42, 42, 42, 44, 45, 45, 46, 46, 46, 46, 46, 50, 50, 50, 50, 50, 55]},
        {tag:"Projects", value:"40", points:[0, 0, 1, 2, 2, 3, 10, 21, 21, 30, 30, 30, 41, 42, 42, 42, 44, 45, 45, 46, 46, 46, 46, 46, 50, 50, 50, 50, 50, 55]},
        {tag:"Analyzed pages", value:"4", points:[100, 0, 1, 2, 2, 3, 10, 21, 21, 30, 30, 30, 41, 42, 42, 42, 44, 45, 45, 46, 46, 46, 46, 46, 50, 50, 50, 50, 50, 55]},
    ]
    const users = [
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", name:"abcde", projectCnt:"5", created:"2015.11.31"},
    ]
    res.render('main/index', getAdminContext({ content:"./admin/dashboard/dashboard.ejs", title:"Dashboard", subtitle:"Welcome Username", cards:cards, users:users }), (e, content) => {
        res.end(content);
    });
});

router.get('/database', (req, res) => {
    // DB Table 조회 후 
    
    const tables = [
        {name:"user", sche:{id:'', uid:"sortable", name:'sortable', email:'sortable'}, data:[{id: '1', uid:'test', name:'1233', email:'ttttt@example.com'}]},
        {name:"project", sche:{}, data:[]},
        {name:"history", sche:{}, data:[]}
    ];

    return res.render('main/index', 
        getAdminContext({content:"./admin/database/database.ejs", 
            title:"Database", 
            subtitle:"List of tables", 
            tables: tables}), (e, content) => {
                console.log(e);
        res.end(content);
    });
})

router.get('/database/getData', async (req, res) => {
    const tableName = req.query.table;

    try {
        // 1. DB에서 해당 테이블 데이터 조회 (예시 로직)
        // const rawData = await db.query(`SELECT * FROM ${tableName}`);
        
        // 2. 스키마 키 추출 (EJS의 sche 객체 로직과 동일하게)
        // id를 제외한 키 목록을 생성
        // const validKeys = Object.keys(rawData[0] || {}).filter(key => key !== 'id');

        // 3. 클라이언트로 응답
        res.status(200).json({
            data: rawData,
            validKeys: validKeys
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/user', (req, res) => {
    const users = [
        {id:"1", mail:"t@example.com", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", mail:"t@example.com", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", mail:"t@example.com", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", mail:"t@example.com", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", mail:"t@example.com", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", mail:"t@example.com", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", mail:"t@example.com", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", mail:"t@example.com", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"5", created:"2015.11.31"},
        {id:"1", mail:"t@example.com", name:"Test 123", projectCnt:"2", created:"2025.11.11"},
        {id:"2", mail:"t@example.com", name:"1234153", projectCnt:"1", created:"2023.11.21"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"3", created:"2015.11.31"},
        {id:"3", mail:"t@example.com", name:"abcde", projectCnt:"5", created:"2015.11.31"},
    ]
    return res.render('main/index', 
        getAdminContext({content:"./admin/user/users.ejs", 
            title:"User list", 
            subtitle:"", 
            users:users}), (e, content) => {
        res.end(content);
    });
})

router.get('/history', (req, res) => {
    const hist = [
        {date:"2025 . 11 . 30   20 : 00", user:"te", project:"Test", page:"test121324345"},
        {date:"2025 . 11 . 21   20 : 00", user:"13", project:"143124234", page:"tfsdafest12345"},
        {date:"2025 . 11 . 22   20 : 00", user:"123", project:"abcd", page:"testsda12345"},
        {date:"2025 . 12 . 29   20 : 00", user:"saf", project:"Test", page:"tes3124t12345"},
        {date:"2025 . 01 . 29   20 : 00", user:"zxcv", project:"3", page:"test1dsafasdf2345"},
        {date:"2025 . 12 . 29   20 : 00", user:"sadf", project:"abcd", page:"testf12345"},
        {date:"2025 . 09 . 29   20 : 00", user:"14", project:"absdafzxcvcd", page:"test4324sda12345"},
        {date:"2025 . 07 . 29   20 : 00", user:"213", project:"Test", page:"sa2"},
        {date:"2025 . 12 . 29   20 : 00", user:"123", project:"1234", page:"test1zxcv2zxcv345"},
        {date:"2025 . 11 . 29   20 : 00", user:"sadf", project:"dsafzxc", page:"test1asdf345"},
        {date:"2025 . 11 . 29   20 : 00", user:"123", project:"eaasdfsd", page:"asdf"},
        {date:"2025 . 11 . 29   20 : 00", user:"f", project:"t", page:"asd"},
        {date:"2025 . 11 . 29   20 : 00", user:"34", project:"1234", page:"tesasdt12345"},
        {date:"2025 . 11 . 29   20 : 00", user:"sadf", project:"abcd", page:"test1asd2345"},
        {date:"2025 . 11 . 29   20 : 00", user:"xzcv", project:"dsf", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", user:"123", project:"Teadsst", page:"teasdfasdfst12345"},
        {date:"2025 . 11 . 29   20 : 00", user:"sf", project:"1234", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", user:"123", project:"a", page:"dasf"},
        {date:"2025 . 11 . 29   20 : 00", user:"4123", project:"abasdfcd", page:"test12345"},
        {date:"2025 . 11 . 29   20 : 00", user:"asdzxcv", project:"3412", page:"test12345"},
    ]
    return res.render('main/index', 
        getAdminContext({content:"./admin/history/history.ejs", 
            title:"Histories", 
            subtitle:"Showing all user's analysis histories", 
            history:hist}), (e, content) => {
        res.end(content);
    });
})

module.exports = router;