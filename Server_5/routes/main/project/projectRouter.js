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
        title: "Add Project",
        subtitle: "Add new project",
        flag: "add"
    }), (e, content) => {
        res.end(content);
    });
});

// 프로젝트 수정 화면
router.get('/edit/:id', async (req, res) => {
    // 로그인 체크
    if (!req.session.user) return res.redirect('/auth/signin');

    const projectId = req.params.id;
    const userId = req.session.user.id;

    try {
        // DB에서 내 프로젝트 조회
        const sql = `SELECT * FROM projects WHERE id = ? AND user_id = ? AND is_deleted = 0`;
        const rows = await db.query(sql, [projectId, userId]);

        if (rows.length === 0) {
            return res.send('<script>alert("존재하지 않거나 권한이 없음"); location.href="/dashboard/project";</script>');
        }

        const project = rows[0];

        // 조회된 데이터를 EJS로 전달
        res.render('main/index', getUserContext({
            content: "./project/setProject.ejs",
            title: "Edit Project",
            subtitle: "Modify your project details",
            flag: "edit", // 수정 모드
            
            //  DB 데이터를 변수로 넘겨줌
            id: project.id,
            projectName: project.title,
            shortDescription: project.description,
            isPublic: project.is_public
        }), (e, content) => {
            if (e) console.error(e);
            res.end(content);
        });
    } catch (err) {
        console.error('수정 화면 에러:', err);
        res.status(500).send('서버 에러');
    }
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

// 프로젝트 수정 
router.post('/editProject', upload.single('thumbnail'), async (req, res) => {
    // 로그인 체크
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }

    const { projectId, projectName, shortDescription } = req.body;
    const userId = req.session.user.id;

    // 공개 여부
    const isPublic = 1;

    try {
        // 업데이트 쿼리
        let sql = `UPDATE projects SET title = ?, description = ?, is_public = ?`;
        let params = [projectName, shortDescription, isPublic];

        // 썸네일 경로 업데이트
        if (req.file) {
            const thumbPath = `/storage/uploads/${req.session.user.login_id}/${req.file.filename}`;
            sql += `, thumb_path = ?`;
            params.push(thumbPath);
        }

        // 내 프로젝트인지 확인
        sql += ` WHERE id = ? AND user_id = ?`;
        params.push(projectId, userId);

        // 실행
        await db.query(sql, params);

        console.log('프로젝트 수정 완료', projectId);
        res.redirect('/dashboard/project');
    } catch (err) {
        console.error('프로젝트 수정 실패 ', err);
        res.status(500).send('수정 중 오류 발생');
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
            return res.send({ success: true, message: 'Deleted project' });
        } else {
            // console.log('권한이 없거나, 이미 삭제됨');
            return res.send({ success: true, message: 'Does not exists project' });
        }

        // res.redirect('/dashboard/project');
    } catch (err) {
        console.error('프로젝트 삭제 실패', err);
        res.status(500).send('삭제 실패');
    }
});

// 페이지(이미지) 상세 정보 조회 라우터
router.get('/page/detail/:id', async (req, res) => {
    // 1. 로그인 체크
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const imageId = req.params.id;
    const userId = req.session.user.id;

    try {
        // 2. DB 조회 쿼리
        // images 테이블을 기준으로 projects(본인 확인용)와 analysis_results(결과 확인용)를 조인
        const sql = `
            SELECT 
                i.id, 
                i.original_name, 
                i.status, 
                i.file_path AS original_path, 
                ar.heatmap_path
            FROM images i
            JOIN projects p ON i.project_id = p.id
            LEFT JOIN analysis_results ar ON i.id = ar.image_id
            WHERE i.id = ? AND p.user_id = ? AND i.is_deleted = 0
        `;

        const rows = await db.query(sql, [imageId, userId]);

        // 3. 데이터 존재 여부 및 권한 확인
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '이미지를 찾을 수 없거나 권한이 없습니다.' });
        }

        const data = rows[0];
        const isAnalyzed = data.status === '완료';

        // 4. 응답 데이터 구성 (프론트엔드 viewPage 함수 요구사항에 맞춤)
        res.status(200).json({
            success: true,
            analyzed: isAnalyzed,               // 분석 완료 여부 (true/false)
            original: data.original_path,       // 원본 이미지 경로
            heatmap: isAnalyzed ? data.heatmap_path : null, // 히트맵 경로 (완료 시에만)
            name: data.original_name            // 페이지 이름 (필요 시 사용)
        });

    } catch (err) {
        console.error('페이지 상세 조회 에러:', err);
        res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
    }
});

// 이미지(페이지) 삭제 라우터
router.get('/page/delete/:id', async (req, res) => {
    // 로그인 체크
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.', rUri: '/auth/signin' });
        // return res.status(401).send('<script>alert("로그인 필요"); location.href="/auth/signin";</script>');
    }

    const imageId = req.params.id;
    const userId = req.session.user.id;

    try {
        // 본인 프로젝트의 이미지인지 확인 후 삭제 (soft delete)
        const sql = `
        UPDATE images i
        JOIN projects p ON i.project_id = p.id
        SET i.is_deleted = 1
        WHERE i.id = ? AND p.user_id = ?`;

        const result = await db.query(sql, [imageId, userId]);
        
        if (result.affectedRows > 0) {
            // console.log('이미지 삭제 완료', imageId);
            return res.status(200).json({ success: true, message: '삭제 성공' });
        } else {
            // console.log('권한 없음', imageId);
            return res.status(403).json({ success: false, message: '권한 없음'});
        }
    } catch (err) {
        // console.err('삭제 에러', err);
        return res.status(500).json({ success: false, message: '서버 에러'});
        // res.status(500).send('서버 에러');
    }
});

// 페이지(이미지) 빈 데이터 생성 라우터 (Lazy Create)
router.post('/page/create', async (req, res) => {
    // 1. 로그인 체크
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인 필요' });
    }

    // 프론트엔드에서 projectId와 newName을 받아와야 함
    const { projectId, newName } = req.body;
    const userId = req.session.user.id;

    if (!projectId || !newName) {
        return res.status(400).json({ success: false, message: '필수 데이터(ID/이름) 누락' });
    }

    try {
        // 2. 프로젝트 소유권 확인 (내 프로젝트인지)
        const checkSql = `SELECT id FROM projects WHERE id = ? AND user_id = ? AND is_deleted = 0`;
        const checkRows = await db.query(checkSql, [projectId, userId]);

        if (checkRows.length === 0) {
            return res.status(403).json({ success: false, message: '권한이 없거나 존재하지 않는 프로젝트입니다.' });
        }

        // 3. 빈 이미지 데이터 생성
        // 파일 경로 등은 없으므로 빈 문자열('')이나 NULL로 처리하고 status는 '생성됨'으로 구분
        const insertSql = `
            INSERT INTO images (project_id, original_name, stored_name, file_path, file_size, status)
            VALUES (?, ?, '', '', 0, '대기')
        `;

        const result = await db.query(insertSql, [projectId, newName]);

        res.status(200).json({ 
            success: true, 
            newId: Number(result.insertId),
            message: '페이지 생성 완료' 
        });

    } catch (err) {
        console.error('페이지 생성 에러:', err);
        res.status(500).json({ success: false, message: 'DB 생성 오류' });
    }
});

// 페이지 이름 변경 라우터

router.post('/page/rename', async (req, res) => {
    // 로그인 체크
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인 필요'});
    }

    const { imageId, newName } = req.body;
    const userId = req.session.user.id;

    if (!imageId || !newName) {
        return res.status(400).json({ success: false, message: '필수 데이터 미입력'});
    }

    try {
        // 내 프로젝트 이미지인지 확인하며 업데이트
        // images 테이블과 projects 테이블 조인 -> user_id 체크
        
        const sql = `
        UPDATE images i
        JOIN projects p ON i.project_id = p.id
        SET i.original_name = ?
        WHERE i.id = ? AND p.user_id = ? AND i.is_deleted = 0`;

        const result = await db.query(sql, [newName, imageId, userId]);

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true });
        } else {
            // ID가 없거나, 내 프로젝트가 아니거나, 이미 삭제된 경우
            res.status(403).json({ success: false, message: '권한이 없거나 존재하지 않음'});
        }
    } catch (err) {
        console.err('페이지 이름 변경 에러', err);
        res.status(500).json({ success: false, message: 'DB 에러'});
    }
});


// 이미지 분석 요청 처리
// upload.single('fileDate') -> html input name과 동일해야 됨
router.post('/analyze', upload.single('fileData'), async (req, res) => {
    // 파일이 제대로 업로드 되었는가
    if (!req.file) {
        return res.status(400).json({ success: false, message: '파일 없음'});
    }

    // 경로 설정
    // 입력 파일 경로 (업로드한 원본)
    const inputPath = req.file.path;
    
    const projectId = req.body.projectId; // 폼 데이터에서 프로젝트 ID 받아오기
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf-8'); // 원본 파일 이름
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
    const pythonScriptPath = path.join(__dirname, '../../../../../ai/ai_tracker.py');
    const pythonDir = path.dirname(pythonScriptPath); // 스크립트가 있는 폴더 경로 추출

    // 라이브러리 경로를 찾지 못해 지정해줌
    const libCusparse = '/usr/local/lib/python3.9/site-packages/nvidia/cusparselt/lib';
    const libNccl = '/usr/local/lib/python3.9/site-packages/nvidia/nccl/lib'

    const missingLibPath = `${libCusparse}:${libNccl}`
    const env = {
        ...process.env,
        LD_LIBRARY_PATH: (process.env.LD_LIBRARY_PATH || '') + ':' + missingLibPath
    };

    console.log('스크립트 경로: ', pythonScriptPath);
    console.log('실행 경로: ', pythonDir);

    const pyProcess = spawn('python', [pythonScriptPath, inputPath, outputPath], {cwd: pythonDir, env: env});

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