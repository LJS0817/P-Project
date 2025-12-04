const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const db = require('../../../config/db');
const upload = require('../../../middleware/upload');
const { rawListeners, title } = require('process');
const e = require('express');
const { getUserContext } = require('../sidebarUtil')

//     원본 코드
// router.get('/', (req, res) => {
//     const projects = [
//         { id: "1", name: "Test 123", desc: "asdailjsk;fmvc,.Csdaf4", author: "opq", pages:[1, 2, 3], updated: "2025.11.11 20:00"},
//         { id: "2", name: "1234153", desc: "qwerfdas32", author: "sadf", pages:[1, 2, 3, 4, 5, 6, 7], updated: "2023.11.21 20:00"},
//         { id: "3", name: "abcde", desc: "13242134321", author: "1234", pages:[1, 2, 3, 4, 1, 1, 1], updated: "2015.11.31 20:00"},
//     ]
//     res.render('main/index', {content:"./project/listProject.ejs", title:"Project", subtitle:"Project manage", projects:projects}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/view/:id', (req, res) => {
//     res.render('main/index', {content:"./project/viewProject.ejs", title:"Project name", subtitle:"Analysis your design"}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/add', (req, res) => {
//     res.render('main/index', {content:"./project/setProject.ejs", title:"Project", subtitle:"Add new project", flag:"add"}, (e, content) => {
//         res.end(content);
//     });
// });

// router.get('/edit/:id', (req, res) => {
//     res.render('main/index', {content:"./project/setProject.ejs", title:"Project", subtitle:"Add new project", flag:"edit"}, (e, content) => {
//         res.end(content);
//     });
// });

// 프로젝트 목록 조회
router.get('/', async (req, res) => {
    if (!req.session.user) { // 로그인 안되어있으면 로그인 화면으로 추방
        return res.redirect('/auth/signin');
    }

    try {
        const userId = req.session.user.id;

        // 삭제되지 않은 본인 프로젝트만 최신순으로 조회
        // pages 컬럼은 추후 테이블 조인 예정
        const sql =`
        SELECT id, title, description, thumb_path, updated_at
        FROM projects
        WHERE user_id = ? AND is_deleted = 0
        ORDER BY created_at DESC`;
        const rows = await db.query(sql, [userId]);

        if(rows.length == 0) {
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

        // EJS에 맞게 데이터 포맷 맞추기
        const projects = rows.map(row => ({
            id: row.id,
            name: row.title,
            desc: row.description,
            author: req.session.user.nickname, // 본인 프로젝트는 닉네임으로 표시
            pages: [], // pages 테이블 연동 시 수정할 예정
            updated: new Date(row.updated_at).toLocaleDateString(),
            thumb: row.thumb_path
        }));

        res.render('main/index', getUserContext({
            content: "./project/listProject.ejs",
            title: "Project",
            subtitle: "Project manage",
            projects: projects
        }), (e, content) => {
            res.end(content);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('DB 오류');
    }
});

// 프로젝트 추가 화면
router.get('/add', (req, res) => {
    res.render('main/index', getUserContext({
        content: "./project/setProject.ejs",
        title: "Project",
        subtitle: "Add new project",
        flag: "add"
    }), (e, content) => {
        res.end(content);
    });
});

// 프로젝트 수정 화면
router.get('/edit/:id', async (req, res) => {
    // 수정 기능 구현 -> DB 조회 로직 추가해야함
    res.render('main/index', getUserContext({
        content: "./project/setProject.ejs",
        title: "Project",
        subtitle: "Edit project",
        flag: "edit"
    }), (e, content) => {
        res.end(content);
    });
});


// 프로젝트 생성
router.post('/addProject', upload.single('thumbnail'), async (req, res) => {
    if (!req.session.user) { // 로그인 안되어있으면 로그인 화면으로 추방
        return res.redirect('/auth/signin');
    }

    // setProject.ejs의 form name과 동일
    const { projectName, shortDescription, visibility } = req.body;
    const userId = req.session.user.id;

    // 썸네일 경로 
    // 업로드된 파일이 있으면 경로 저장, 없으면 기본 이미지
    const thumbPath = req.file ? `/storage/uploads/${req.session.user.login_id}/${req.file.filename}` : '';

    // 공개 여부 처리
    const isPublic = 1;

    try {
        const sql = `
        INSERT INTO projects (user_id, title, description, thumb_path, is_public)
        VALUES (?, ?, ?, ?, ?)`;

        await db.query(sql, [userId, projectName, shortDescription, thumbPath, isPublic]);

        console.log('프로젝트 만들어짐', projectName);
        res.redirect('/dashboard/project');
    } catch (err) {
        console.error('프로젝트 못만듬', err);
        res.status(500).send('생성 중 오류 발생');
    }
});

// 프로젝트 상세 보기
router.get('/view/:id', async (req, res) => {
    try {
        const projectId = req.params.id;

        // 프로젝트 존재 여부 및 권한 확인
        const sql = `SELECT * FROM projects WHERE id = ? AND is_deleted = 0`;
        const rows = await db.query(sql, [projectId]);

        if (rows.length === 0) {
            return res.status(404).send('프로젝트 못찾겠어');
        }

        const project = rows[0];

        
        // DB 조회해서 더미 데이터가 아닌 실제 데이터 조회 코드
        
        // 프로젝트에 속한 이미지(page) 목록 조회
        const imageSql = `
        SELECT id, original_name, status, created_at
        FROM images
        WHERE project_id = ? AND is_deleted = 0
        ORDER BY page_order ASC, created_at ASC`;
        const imageRows = await db.query(imageSql, [projectId]);

        // EJS에 보낼 데이터 포맷
        const pages = imageRows.map(img => ({
            id: img.id,
            name: img.original_name,
            // status가 ;완료'이면 true, 아니면 false
            analyzed: img.status === '완료',
            // 날짜 포맷
            datetime: new Date(img.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            })
        }));
        
        // const pages = [
        //     { id: "1", name: "Test 123", analyzed: true, datetime: "2025.11.11 20:00"},
        //     { id: "2", name: "1234153", analyzed: true, datetime: "2023.11.21 20:00"},
        //     { id: "3", name: "abcde", analyzed: false, datetime: "2015.11.31 20:00"},
        // ]

        res.render('main/index', getUserContext({
            content: "./project/viewProject.ejs",
            title: project.title,
            subtitle: "Analysis your design",
            projectId: project.id, // viewProject.ejs에서 파일 업로드 할 때 필요할 수도 있음
            pages: pages
        }), (e, content) => {
            res.end(content);
        });
    } catch (err) {
        console.error('상세보기 에러', err);
        res.status(500).send('상세보기 에러');
    }
});

// 프로젝트 삭제
router.get('/delete/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/signin');

    const projectId = req.params.id;
    const userId = req.session.user.id;

    try {
        // 본인 프로젝트인지 확인 후 삭제 -> is_deleted = 1
        const sql = `UPDATE projects SET is_deleted = 1 WHERE id = ? AND user_id = ?`;
        const result = await db.query(sql, [projectId, userId]);

        if (result.affectedRows > 0) {
            console.log('프로젝트 삭제 완료', projectId);
        } else {
            console.log('권한이 없거나, 이미 삭제됨');
        }

        res.redirect('/dashboard/project');
    } catch (err) {
        console.error('프로젝트 삭제 실패', err);
        res.status(500).send('삭제 실패');
    }
});


// 이미지 분석 요청 처리
// upload.single('fileDate') -> html input name과 동일해야 됨
router.post('/analyze', upload.single('fileData'), async (req, res) => {

    console.log("1");
    // 파일이 제대로 업로드 되었는가
    if (!req.file) {
        return res.status(400).json({ success: false, message: '파일 없음'});
    }

    // 경로 설정
    // 입력 파일 경로 (업로드한 원본)
    const inputPath = req.file.path;
    
    const projectId = req.body.projectId; // 폼 데이터에서 프로젝트 ID 받아오기
    const originalName = req.file.originalname; // 원본 파일 이름
    const storedName = req.file.filename; // 저장된 파일 이름

    // 결과 파일 저장 경로
    const userId = req.session.user ? req.session.user.login_id : 'guest' // 일단 guest도 추가해둠
    const resultDir = path.join(__dirname, '../../../public/storage/results', userId);

    // 결과 폴더 없으면 생성
    if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir, { recursive: true});
    }

    // 결과 파일명 (heatmap_원본이름)
    const outputFileName = 'heatmap_' + req.file.filename;
    const outputPath = path.join(resultDir, outputFileName);

    // 웹에서 접근 가능한 경로 ( DB용)
    const webOriginalPath = `/storage/uploads/${userId}/${storedName}`;
    const webHeatmapPath = `/storage/results/${userId}/${outputFileName}`;

    // DB에 ;'대기' 상태로 원본 이미지 먼저 저장
    let imageId;
    try {
        const insertImageSql = `
        INSERT INTO images (project_id, original_name, stored_name, file_path, file_size, status)
        VALUES (?, ?, ?, ?, ?, '대기')`;
        const result = await db.query(insertImageSql, [projectId, originalName, storedName, webOriginalPath, req.file.size]);
        imageId = Number(result.insertId); // 방금 저장된 ID
    } catch (err) {
        console.error(' DB에 이미지 저장 실패 ', err);
        return res.status(500).json({ success: false, message: 'DB 에러'});
    }

    // 모델 실행
    // 실행 명령어 -> python ai/test.py [입력경로] [출력경로]
    const pythonScriptPath = path.join(__dirname, '../../../../../ai/test.py');
    const pyProcess = spawn('python', [pythonScriptPath, inputPath, outputPath]);

    pyProcess.stdout.on('data', (data) => {
        console.log('PYthon Output : ', data.toString());
    })

    let errorData = '';

    // 에러 로그 수집
    pyProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error('python 오류', data.toString());
    });

    // 프로세스 종료 처리 -> 결과 전송
    pyProcess.on('close', async (code) => {
        console.log(code);
        if (code === 0) {
            // 성공 시 : 웹에서 접근 가능한 이미지 URL 반환
            await db.query(`UPDATE images SET status = '완료' WHERE id = ?`, [imageId]); // images 테이블 상태 업데이트

            await db.query(`
                INSERT INTO analysis_results (image_id, heatmap_path)
                VALUES (?, ?)`, [imageId, webHeatmapPath]);

            const webImageUrl = `/storage/results/${userId}/${outputFileName}`;

            res.status(200).json({
                success: true,
                message: '분석 완료',
                original: webOriginalPath, // 원본 경로
                heatmap: webHeatmapPath // 결과 히트맵 경로
            });
        } else {
            // 실패 시 업데이트
            await db.query(`UPDATE images SET status= '실패', failure_message = ? WHERE id = ?`,
                [errorData.substring(0, 200), imageId]
            );
            
            res.status(500).json({
                success: false,
                message: '분석 실패',
                error: errorData
            });
        }
    });
});

module.exports = router;