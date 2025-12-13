const express = require("express");
const router = express.Router();
const db = require("../../config/db"); 
const axios = require("axios");

// 로그인 페이지
router.get("/signin", (req, res) => {
  res.render("auth/sign", { authForm: "../../views/auth/signin.ejs" }, (e, c) => res.end(c));
});

// [핵심 수정] 로그인 처리 (DB에서 언어 설정 불러오기)
router.post("/signin", async (req, res) => {
  const { userid, password, remember } = req.body;

  try {
    // 1. SELECT 쿼리에 's.language'를 반드시 포함해야 합니다.
    const sql = `
      SELECT u.*, s.date_format, s.theme, s.language 
      FROM users u 
      LEFT JOIN user_settings s ON u.id = s.user_id 
      WHERE u.login_id = ?
    `;
    const rows = await db.query(sql, [userid]);

    if (rows.length > 0) {
      const user = rows[0];
      if (user.password === password) {
        console.log("로그인 성공 :", user.nickname);

        // 2. DB에 저장된 언어(en/ko)를 가져와서 쿠키에 굽습니다.
        // (DB 값이 없으면 기본값 'ko')
        const userLang = user.language || 'ko';
        res.cookie('lang', userLang, { maxAge: 900000, httpOnly: true });

        // 3. 세션에도 언어 정보를 저장합니다.
        req.session.user = {
          id: user.id,
          login_id: user.login_id,
          nickname: user.nickname,
          email: user.email,
          IS_ADMIN: user.IS_ADMIN,
          date_format: user.date_format || "YYYY. MM. DD",
          theme: user.theme || "default",
          language: userLang, // 세션 저장
        };

        if (remember) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; 
        } else {
            req.session.cookie.expires = false; 
            req.session.cookie.maxAge = null;
        }
        
        req.session.save(() => {
          res.json({ success: true, redirectUrl: '/dashboard' });
        });
      } else {
        return res.status(400).json({ success: false, reason: ["pwd"], msg: "Incorrect username or password." });
      }
    } else {
      return res.status(400).json({ success: false, reason: ["id", "pwd"], msg: "Incorrect username or password." });
    }
  } catch (err) {
    console.error("로그인 에러: ", err);
    res.status(500).send("서버 에러");
  }
});

// 회원가입 페이지
router.get("/signup", (req, res) => {
  res.render("auth/sign", { authForm: "../../views/auth/signup" }, (e, c) => res.end(c));
});

// 회원가입 처리
router.post("/signup", async (req, res) => {
  const { userid, password, useremail, username } = req.body;
  const finalNickname = username ? username : userid;

  try {
    const checkSql = "SELECT login_id FROM users WHERE login_id = ? OR email = ? OR nickname = ?";
    const rows = await db.query(checkSql, [userid, useremail, finalNickname]);

    if (rows.length > 0) {
      return res.status(400).json({ success: false, msg: "이미 존재하는 사용자입니다." });
    }

    const insertSql = `
        Insert INTO users (login_id, email, password, nickname, provider, IS_ADMIN)
        VALUES (?, ?, ?, ?, 'gachon', 0)`;

    const result = await db.query(insertSql, [userid, useremail, password, finalNickname]);
    const newUserId = Number(result.insertId);

    // [설정] 기본 언어를 'ko'로 저장
    const settingSql = `INSERT INTO user_settings (user_id, language) VALUES (?, 'ko')`;
    await db.query(settingSql, [newUserId]);

    console.log("회원가입 성공 ID :", userid);
    return res.status(200).json({ success: true, redirectUrl: "/auth/signin" });
  } catch (err) {
    console.error("회원가입 에러", err);
    res.status(500).send("서버 오류");
  }
});

// 비밀번호 찾기
router.get("/forgot-password", (req, res) => {
  res.render("auth/sign", { authForm: "../../views/auth/forgot_password.ejs" }, (e, c) => res.end(c));
});

router.post("/forgot-password", async (req, res) => {
  return res.status(200).json({ success: true, status: "verify", postUrl: "/auth/forgot/verify" });
  // const { userid, useremail } = req.body;
  // try {
  //   const rows = await db.query(`SELECT * FROM users WHERE login_id = ? AND email = ?`, [userid, useremail]);
  //   if (rows.length > 0) {
  //     // 세션에 email과 코드 저장
  //     // 다음 페이지에서 비밀번호를 바꿀 사용자를 식별하기 위함
  //     return res.status(200).json({ success: true, status: "verify", postUrl: "/forgot/verify" });
  //   } else {
  //     return res.status(400).json({ success: false });
  //   }
  // } catch (err) {
  //   res.status(500).send("서버 오류");
  // }
});

router.post("/forgot/verify", async (req, res) => {
  // 식별
  // req.session.userId;
  // if(req.session.userId == undefined) return res.redirect('/auth/signin')
  // else {
      return res.status(200).json({ success: true, status: "newPwd", postUrl: "/auth/forgot/newPwd" });
  //}
});

router.post("/forgot/newPwd", async (req, res) => {
  // 성공 실패 
  return res.status(200).json({ success: true, status: "done" });
});


// [중요] 로그아웃 (언어 쿠키 유지)
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("로그아웃 실패");
    
    res.clearCookie("Heatmap");
    // res.clearCookie("lang"); // 이 줄을 삭제하거나 주석 처리해야 언어 설정이 유지됩니다.
    
    res.redirect("/");
  });
});

// 소셜 로그인 관련 설정
const GOOGLE_CLIENT_ID = "구글 클라이언트 ID";
const GOOGLE_CLIENT_SECRET = "구글 시크릿 키";
const GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";
const KAKAO_CLIENT_ID = "카카오 클라이언트 ID";
const KAKAO_REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";

router.get("/google", (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=email%20profile`;
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: GOOGLE_REDIRECT_URI, grant_type: "authorization_code",
    });
    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } });
    await handleSocialLogin(req, res, userRes.data.id, userRes.data.email, userRes.data.name, "google");
  } catch (err) { res.status(500).send("구글 로그인 실패"); }
});

router.get("/kakao", (req, res) => {
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(url);
});

router.get("/kakao/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post("https://kauth.kakao.com/oauth/token", null, {
        params: { grant_type: "authorization_code", client_id: KAKAO_CLIENT_ID, redirect_uri: KAKAO_REDIRECT_URI, code },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } });
    await handleSocialLogin(req, res, String(userRes.data.id), userRes.data.kakao_account.email, userRes.data.properties.nickname, "kakao");
  } catch (err) { res.status(500).send("카카오 로그인 실패"); }
});

// 소셜 로그인 공통 처리 (언어 설정 추가)
async function handleSocialLogin(req, res, socialId, email, nickname, provider) {
  try {
    const checkSql = `
      SELECT u.*, s.date_format, s.theme, s.language 
      FROM users u 
      LEFT JOIN user_settings s ON u.id = s.user_id 
      WHERE u.login_id = ? AND u.provider = ?
    `;
    const rows = await db.query(checkSql, [socialId, provider]);
    let user;

    if (rows.length > 0) {
      user = rows[0];
    } else {
      const insertSql = `INSERT INTO users (login_id, email, password, nickname, provider, IS_ADMIN) VALUES (?, ?, NULL, ?, ?, 0)`;
      const result = await db.query(insertSql, [socialId, email, nickname, provider]);
      const newUserId = Number(result.insertId);
      
      await db.query(`INSERT INTO user_settings (user_id, language) VALUES (?, 'ko')`, [newUserId]);
      
      const newRows = await db.query(checkSql, [socialId, provider]);
      user = newRows[0];
    }

    // 언어 설정 적용
    const userLang = user.language || 'ko';
    res.cookie('lang', userLang, { maxAge: 900000, httpOnly: true });

    req.session.user = {
      id: user.id,
      login_id: user.login_id,
      nickname: user.nickname,
      email: user.email,
      IS_ADMIN: user.IS_ADMIN,
      date_format: user.date_format || "YYYY. MM. DD",
      theme: user.theme || "default",
      language: userLang,
    };

    req.session.save(() => { res.redirect("/dashboard"); });
  } catch (err) {
    console.error("소셜 로그인 에러", err);
    res.status(500).send("로그인 실패");
  }
}

module.exports = router;