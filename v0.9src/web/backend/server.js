//// v0.5src/web/server.js
const i18n = require('i18n');
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// 세션 설정 불러오기
const sessionMiddleware = require('./config/session');

// 세션 미들웨어 사용
app.use(sessionMiddleware);

// 모든 EJS에서 세션 정보 사용 가능하도록 설정
app.use((req, res, next) => {
    // 세션에 user 정보가 있으면 res.locals.user에 저장 (없으면 null 저장)
    res.locals.user = req.session.user || null;
    next();
});

// 클라이언트가 보낸 JSON 및 Form 데이터 해석 설정
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// body parser 설정 (폼 데이터 처리) 이거 없으면 req.body가 undefined로 나와버려
app.use(express.urlencoded({ extended: true }));

i18n.configure({
    locales: ['ko', 'en'], // 지원할 언어 설정
    directory: path.join(__dirname, 'locales'), // JSON 파일 위치
    defaultLocale: 'ko', // 기본 언어
    cookie: 'lang', // 언어 설정을 저장할 쿠키 이름
    objectNotation: true,
    updateFiles: false,
});

app.use(i18n.init);

// 팀 전용 포트 (24팀)
const PORT = 65024;

// EJS 및 정적 파일 설정
app.set('view engine', 'ejs');

// server.js 파일 디렉터리 기준으로 템플릿 파일 경로 설정(EJS)
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정(이미지, css, JS 등)
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/menu/menuRouter'));
app.use('/auth', require('./routes/auth/authRouter'));
app.use('/dashboard', require('./routes/main/dashboard/router'));
app.use('/dashboard/project', require('./routes/main/project/projectRouter'));
app.use('/dashboard/history', require('./routes/main/history/historyRouter'));
app.use('/dashboard/settings', require('./routes/main/settings/settingRouter'));
app.use('/admin', require('./routes/main/admin/adminRouter'));


// AI 연동 테스트 API
app.get('/api/test-ai', (req, res) => {
    let isResponseSent = false;
    // 상대경로 2단계 위의 ai/test.py 스크립트 경로
    const pythonScriptPath = path.join(__dirname, '../../ai/test.py');

    // 파이썬 프로세스 실행 (매개변수로 'team24' 전달)
    const pyProcess = spawn('python', [pythonScriptPath, 'team24']);

    const timeout = setTimeout(() => {
        if (!pyProcess.killed && !isResponseSent) {
            console.error('timeout');
            pyProcess.kill();
            isResponseSent = true;
            res.status(504).send('timeout');
        }
    }, 30000) // 30 second
    let resultData = '';
    let errorData = '';

    // 파이썬의 print() 결과 받기
    pyProcess.stdout.on('data', (data) => {
        resultData += data.toString();
    });

    // 에러 발생 시
    pyProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
        errorData += data.toString();
    });

    // 프로세스 종료 시 웹으로 결과 전송
    pyProcess.on('close', (code) => {

        clearTimeout(timeout)
        if (isResponseSent) return; // 이미 타임아웃 응답시 무시
        isResponseSent = true; // 응답 보냄

        if (code === 0) {
            res.send(`<h1>성공</h1><p>${resultData}</p>`);
            res.status(200).json({
                status: 'success',
                data: resultData
            });
        } else {
            res.status(500).send('AI Process Failed');
            res.status(500).json({
                status: 'error',
                message: 'AI Process Failed',
                error: errorData
            });
        }
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on http://ceprj2.gachon.ac.kr:${PORT}`);
});
