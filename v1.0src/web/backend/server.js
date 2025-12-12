//// v0.5src/web/server.js
const i18n = require("i18n");
const express = require("express");
const cookieParser = require("cookie-parser"); // 쿠키 파서 모듈
const { spawn } = require("child_process");
const path = require("path");
const app = express();

// 세션 설정 불러오기
const sessionMiddleware = require("./config/session");

// [중요] 쿠키 파서 미들웨어 사용 (i18n보다 먼저 선언)
app.use(cookieParser());

// 세션 미들웨어 사용
app.use(sessionMiddleware);

// 모든 EJS에서 세션 정보 사용 가능하도록 설정
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// 클라이언트가 보낸 JSON 및 Form 데이터 해석 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// i18n 설정
i18n.configure({
  locales: ["ko", "en"], // 지원할 언어
  directory: path.join(__dirname, "locales"), // JSON 파일 위치
  defaultLocale: "ko", // 기본 언어
  cookie: "lang", // 언어 설정을 저장할 쿠키 이름
  objectNotation: true,
  updateFiles: false,
});

// i18n 초기화
app.use(i18n.init);

// 뷰에서 __() 함수 사용 가능하게 설정
app.use((req, res, next) => {
    res.locals.__ = res.__;
    res.locals.locale = req.getLocale();
    next();
});

// 팀 전용 포트 (24팀)
const PORT = 65024;

// EJS 및 정적 파일 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 라우터 등록
app.use("/", require("./routes/menu/menuRouter"));
app.use("/auth", require("./routes/auth/authRouter"));
app.use("/dashboard", require("./routes/main/dashboard/router"));
app.use("/dashboard/project", require("./routes/main/project/projectRouter"));
app.use("/dashboard/history", require("./routes/main/history/historyRouter"));
app.use("/dashboard/settings", require("./routes/main/settings/settingRouter"));
app.use("/admin", require("./routes/main/admin/adminRouter"));

// AI 연동 테스트 API
app.get("/api/test-ai", (req, res) => {
  let isResponseSent = false;
  const pythonScriptPath = path.join(__dirname, "../../ai/test.py");
  const pyProcess = spawn("python", [pythonScriptPath, "team24"]);

  const timeout = setTimeout(() => {
    if (!pyProcess.killed && !isResponseSent) {
      console.error("timeout");
      pyProcess.kill();
      isResponseSent = true;
      res.status(504).send("timeout");
    }
  }, 30000); 

  let resultData = "";
  let errorData = "";

  pyProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pyProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
    errorData += data.toString();
  });

  pyProcess.on("close", (code) => {
    clearTimeout(timeout);
    if (isResponseSent) return;
    isResponseSent = true;

    if (code === 0) {
      res.send(`<h1>성공</h1><p>${resultData}</p>`);
    } else {
      res.status(500).send("AI Process Failed");
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://ceprj2.gachon.ac.kr:${PORT}`);
});