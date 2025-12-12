const express = require("express");
const router = express.Router();
const db = require("../../../config/db"); 
const { getUserContext } = require("../sidebarUtil");

// 설정 메인 (Account 탭)
router.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/signin");
  res.render("main/index", getUserContext(req, {
      content: "./settings/settings.ejs",
      title: "settingTitle",
      subtitle: "settingSubtitle",
      which: "account",
      index: 0,
    }), (e, content) => res.end(content)
  );
});

// 설정 (Preferences 탭)
router.get("/preferences", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/signin");
  res.render("main/index", getUserContext(req, {
      content: "./settings/settings.ejs",
      title: "settingTitle",
      subtitle: "settingSubtitle",
      which: "prefer",
      index: 1,
    }), (e, content) => res.end(content)
  );
});

// 설정 (Project 탭)
router.get("/project", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/signin");
  res.render("main/index", getUserContext(req, {
      content: "./settings/settings.ejs",
      title: "settingTitle",
      subtitle: "settingSubtitle",
      which: "project",
      index: 2,
    }), (e, content) => res.end(content)
  );
});

// 설정 업데이트 (테마, 날짜포맷, 언어)
router.post("/update", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth");
  
  const userId = req.session.user.id;
  const { dateFormat, theme, language } = req.body; 

  try {
    await db.query(
      `UPDATE user_settings SET date_format = ?, theme = ?, language = ? WHERE user_id = ?`,
      [dateFormat, theme, language, userId]
    );

    req.session.user.date_format = dateFormat;
    req.session.user.theme = theme;
    req.session.user.language = language;

    if (language) {
      res.cookie("lang", language, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });
      req.setLocale(language); 
    }

    req.session.save(() => {
      res.send({ success: true, message: "설정이 저장되었습니다." });
    });
  } catch (err) {
    console.error("설정 업데이트 에러", err);
    res.status(500).send({ success: false, message: err.message });
  }
});

// 회원 정보 수정 (닉네임, 이메일)
router.post("/update-account", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth");
  const userId = req.session.user.id;
  const { nickname, email } = req.body;

  try {
    await db.query(`UPDATE users SET nickname = ?, email = ? WHERE id = ?`, [nickname, email, userId]);
    req.session.user.nickname = nickname;
    req.session.user.email = email;
    req.session.save(() => { res.send({ success: true }); });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});

// 회원 탈퇴 (Hard Delete)
router.post("/delete-account", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "로그인 필요" });
  const userId = req.session.user.id;

  try {
    await db.query(`DELETE FROM user_settings WHERE user_id = ?`, [userId]);
    await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
    req.session.destroy(() => { res.json({ success: true }); });
  } catch (err) {
    res.status(500).json({ success: false, message: "DB 에러" });
  }
});

// ================================================================
// [추가] 프로젝트 관리 기능 (Soft Delete)
// ================================================================

// 1. 모든 페이지(이미지) 삭제 (휴지통으로 이동)
router.post("/delete-all-pages", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const userId = req.session.user.id;

    try {
        // 내 프로젝트에 속한 모든 이미지를 is_deleted = 1로 변경
        const sql = `
            UPDATE images i
            INNER JOIN projects p ON i.project_id = p.id
            SET i.is_deleted = 1
            WHERE p.user_id = ?
        `;
        await db.query(sql, [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. 모든 프로젝트 삭제 (휴지통으로 이동)
router.post("/delete-all-projects", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const userId = req.session.user.id;

    try {
        // 내 모든 프로젝트 숨김 처리
        await db.query(`UPDATE projects SET is_deleted = 1 WHERE user_id = ?`, [userId]);
        
        // (옵션) 프로젝트가 지워졌으니 그 안의 이미지도 같이 숨김 처리
        const sqlImages = `
            UPDATE images i
            INNER JOIN projects p ON i.project_id = p.id
            SET i.is_deleted = 1
            WHERE p.user_id = ?
        `;
        await db.query(sqlImages, [userId]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;