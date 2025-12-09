const express = require("express");
const router = express.Router();
const db = require("../../config/db"); // DB 연결 추가
const axios = require("axios");

// 로그인 페이지 라우트 /signin
router.get("/signin", (req, res) => {
  res.render(
    "auth/sign",
    { authForm: "../../views/auth/signin.ejs" },
    (e, content) => {
      res.end(content);
    }
  );
});

// 로그인 처리 라우트 /signin
router.post("/signin", async (req, res) => {
  // 폼에서 보낸 데이터 받기
  const { userid, password } = req.body;

  try {
    // DB에서 사용자 조회
    const sql = `SELECT u.*, s.date_format, s.theme FROM users u LEFT JOIN user_settings s ON u.id = s.user_id WHERE u.login_id = ?`;
    const rows = await db.query(sql, [userid]);

    if (rows.length > 0) {
      // 사용자가 존재 -> 비밀번호 비교
      const user = rows[0];
      if (user.password === password) {
        // 비밀번호 일치
        console.log("로그인 성공 :", user.nickname, user.email);

        // 세션에 사용자 정보 저장
        req.session.user = {
          id: user.id,
          login_id: user.login_id,
          nickname: user.nickname,
          email: user.email,
          date_format: user.date_format || "YYYY. MM. DD",
          theme: user.theme || "default",
        };

        // 세션 저장 후 대시보드로 이동
        req.session.save(() => {
          return res.status(200).json({
            success: true,
            redirectUrl: "/dashboard",
          });
          // res.redirect('/dashboard');
        });
      } else {
        return res.status(400).json({
          success: false,
          reason: ["pwd"],
          msg: "Incorrect username or password.",
        });
        // res.send(`<script>alert('비밀번호가 틀렸음'); history.back();</script>`); // 바로 이전 페이지로 이동
      }
    } else {
      // 사용자가 존재하지 않음
      return res.status(400).json({
        success: false,
        reason: ["id", "pwd"],
        msg: "Incorrect username or password.",
      });
      // res.send(`<script>alert('존재하지 않는 사용자임'); history.back();</script>`); // 바로 이전 페이지로 이동
    }
  } catch (err) {
    console.error("로그인 에러: ", err);
    res.status(500).send("서버가 이상해용");
  }
});

// 회원가입 페이지 라우트 /signup
router.get("/signup", (req, res) => {
  res.render(
    "auth/sign",
    { authForm: "../../views/auth/signup" },
    (e, content) => {
      res.end(content);
    }
  );
});

// 회원가입 처리 라우트 /signup
router.post("/signup", async (req, res) => {
  // 폼에서 보낸 데이터 받기
  const { userid, password, useremail, username } = req.body;

  // 닉네임 입력이 없을 시 아이디를 닉네임으로 사용
  const finalNickname = username ? username : userid;

  // DB에 사용자 추가
  try {
    const checkSql =
      "SELECT login_id, email, nickname FROM users WHERE login_id = ? OR email = ? OR nickname = ?";
    const rows = await db.query(checkSql, [userid, useremail, finalNickname]);

    if (rows.length > 0) {
      // 중복된 데이터 존재시 중복 항목 확인
      const user = rows[0];
      let reason = [];
      let duplicateFields = [];
      if (user.login_id === userid) {
        reason.push("id");
        duplicateFields.push("id");
      }
      if (user.email === useremail) {
        reason.push("mail");
        duplicateFields.push("email");
      }
      if (user.nickname === finalNickname) {
        reason.push("name");
        duplicateFields.push("username");
      }

      let msg =
        "Someone already has " + duplicateFields.join(", ") + ". Try another";

      return res.status(400).json({
        success: false,
        reason: reason,
        msg: msg,
      });
      // return res.send(`<script>alert('${msg}'); history.back();</script>`); // 바로 이전 페이지로 이동
    }

    // DB에 INSERT
    // DB 컬럼 : id, email, password, nickname
    // 넣을 값 : userid, email, password, finalNickname
    const insertSql = `
        Insert INTO users (login_id, email, password, nickname, provider)
        VALUES (?, ?, ?, ?, 'gachon')`;

    const result = await db.query(insertSql, [
      userid,
      useremail,
      password,
      finalNickname,
    ]);

    // 방금 가입한 유저의 ID 가져오기 및 기본 설정값 생성
    const newUserId = Number(result.insertId);

    // 설정 테이블에 설정 값 추가하기
    const settingSql = `INSERT INTO user_settings (user_id) VALUES (?)`;
    await db.query(settingSql, [newUserId]);

    console.log("회원가입 성공 ID :", userid, "email :", useremail);

    return res.status(200).json({
      success: true,
      redirectUrl: "/auth/signin",
    });
    // res.send(`<script>alert('회원가입 성공. 로그인 페이지로 이동.'); location.href='/auth/signin';</script>`); // 로그인 페이지로 이동
  } catch (err) {
    console.error("회원가입 에러", err);
    res.status(500).send("서버 오류");
  }
});

router.get("/forgot-password", (req, res) => {
  res.render(
    "auth/sign",
    { authForm: "../../views/auth/forgot_password.ejs" },
    (e, content) => {
      res.end(content);
    }
  );
});

router.post("/forgot-password", async (req, res) => {
  const { useremail } = req.body;

  try {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const rows = await db.query(sql, [useremail]);

    if (rows.length > 0) {
      // 실제 메일 발송 로직 대신 로그 출력 (추후 nodemailer 등으로 구현 가능)
      console.log(`[Password Reset] Reset link sent to: ${useremail}`);

      return res.status(200).json({
        success: true,
        message: "A password reset link has been sent to your email.",
        redirectUrl: "/auth/signin",
      });
    } else {
      return res.status(400).json({
        success: false,
        msg: "No account found with that email address.",
      });
    }
  } catch (err) {
    console.error("비밀번호 찾기 에러", err);
    res.status(500).send("서버 오류");
  }
});

// 로그아웃 처리 라우트 /signout

router.get("/logout", (req, res) => {
  // 세션 삭제
  req.session.destroy((err) => {
    if (err) {
      console.error("로그아웃 에러", err);
      return res.status(500).send("로그아웃 실패");
    }

    // 세션 쿠키도 클라이언트에서 삭제시킴
    res.clearCookie("Heatmap");

    console.log("로그아웃 성공, 메인으로 이동");
    res.redirect("/");
  });
});

// 소셜 로그인 Google

const GOOGLE_CLIENT_ID = "구글 클라이언트 ID";
const GOOGLE_CLIENT_SECRET = "구글 시크릿 키";
const GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";

// 구글 로그인 페이지로 이동
router.get("/google", (req, res) => {
  const scope =
    "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${GOOGLE_REDIRECT_URI}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.redirect(url);
});

// 구글 인증 후 콜백
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token } = tokenRes.data;

    // 토큰으로 사용자 정보 가져오기
    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const { id: googleId, email, name } = userRes.data;

    // DB 조회 및 로그인/회원가입 처리
    await handleSocialLogin(req, res, googleId, email, name, "google");
  } catch (err) {
    console.error("구글 로그인 에러", err);
    res.status(500).send("구글 로그인에 실패했어");
  }
});

// 소셜 로그인 Kakao
const KAKAO_CLIENT_ID = "카카오 클라이언트 ID";
const KAKAO_REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";

// 카카오 로그인 페이지로 이동
router.get("/kakao", (req, res) => {
  const url =
    "https://kauth.kakao.com/oauth/authorize" +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${KAKAO_REDIRECT_URI}` +
    `&response_type=code`;

  res.redirect(url);
});

// 카카오 인증 후 콜백
router.get("/kakao/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: KAKAO_REDIRECT_URI,
          code,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = tokenRes.data;

    // 토큰으로 사용자 정보 가져오기
    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const kakaoId = String(userRes.data.id);
    const email = userRes.data.kakao_account.email;
    const nickname = userRes.data.properties.nickname;

    // 로그인 처리
    await handleSocialLogin(req, res, kakaoId, email, nickname, "kakao");
  } catch (err) {
    console.error("카카오 로그인 에러", err);
    res.status(500).send("카카오 로그인에 실패했어");
  }
});

// DB 저장 및 세션

async function handleSocialLogin(
  req,
  res,
  socialId,
  email,
  nickname,
  provider
) {
  try {
    // DB에서 사용자 조회
    const checkSql = `SELECT u.*, s.date_format, s.theme FROM users u LEFT JOIN user_settings s ON u.id = s.user_id WHERE u.login_id = ? AND u.provider = ?`;
    const rows = await db.query(checkSql, [socialId, provider]);

    let user;

    if (rows.length > 0) {
      // 이미 가입된 유저는 바로 로그인
      user = rows[0];
      console.log("로그인 성공 :", user.nickname, user.email);
    } else {
      // 가입되지 않은 유저는 회원가입
      console.log("신규 회원가입", provider);

      // login_id에 소셜 고유 ID 넣기
      const insertSql = `INSERT INTO users (login_id, email, password, nickname, provider) VALUES (?, ?, NULL, ?, ?)`;
      const result = await db.query(insertSql, [
        socialId,
        email,
        nickname,
        provider,
      ]);

      const newUserId = Number(result.insertId);

      // 설정 초기 값
      await db.query(`INSERT INTO user_settings (user_id) VALUES (?)`, [
        newUserId,
      ]);

      // 가입된 정보 다시 가져옴
      const newRows = await db.query(checkSql, [socialId, provider]);
      user = newRows[0];
    }

    // 세션 생성
    req.session.user = {
      id: user.id,
      login_id: user.login_id,
      nickname: user.nickname,
      email: user.email,
      date_format: user.date_format || "YYYY. MM. DD",
      theme: user.theme || "default",
    };

    req.session.save(() => {
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.error("소셜 로그인 에러", err);
    res.status(500).send("소셜 로그인에 실패했어");
  }
}

module.exports = router;
