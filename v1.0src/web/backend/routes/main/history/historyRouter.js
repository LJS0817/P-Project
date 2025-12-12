//historyRouter.js
const express = require("express");
const router = express.Router();
const { getUserContext } = require("../sidebarUtil");
const db = require("../../../config/db");

// 날짜 포맷팅 헬퍼 함수
function formatDateTime(date, format) {
  if (!date) return "-";
  // format이 없으면 기본값 설정
  if (!format) format = "YYYY. MM. DD HH:mm";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";

  let result = format;
  result = result.replace("YYYY", year);
  result = result.replace("YY", String(year).slice(-2));
  result = result.replace("MM", month);
  result = result.replace("DD", day);
  result = result.replace("HH", String(hours24).padStart(2, "0"));
  result = result.replace("hh", String(hours12).padStart(2, "0"));
  result = result.replace("mm", minutes);
  result = result.replace("a", ampm);

  return result;
}

router.get("/", async (req, res) => {
  // 로그인 체크
  if (!req.session.user) {
    return res.redirect("/auth/signin");
  }

  const userId = req.session.user.id;
  // userDateFormat이 없을 경우를 대비하여 기본값 처리는 formatDateTime 함수 내에서 수행하거나 여기서 기본값을 설정할 수 있습니다.
  // 여기서는 undefined 그대로 전달하고 함수 내부에서 처리하도록 합니다.
  const userDateFormat = req.session.user.date_format;

  try {
    const projectCheckSql = `
            SELECT 1 
            FROM projects 
            WHERE user_id = ? AND is_deleted = 0 
            LIMIT 1
        `;
    const projectCheckResult = await db.query(projectCheckSql, [userId]);

    //데이터가 하나도 없으면 -> emptyProject 렌더링
    if (projectCheckResult.length === 0) {
      return res.render(
        "main/index",
        getUserContext(req, {
          content: "./project/emptyProject.ejs",
          title: "historyTitle",
          subtitle: "projectEmptySubtitle",
          flag: "add",
        }),
        (err, html) => {
          if (err) console.error("렌더링 에러", err);
          res.end(html);
        }
      );
    }

    // DB에서 히스토리 조회
    // (사용자의 프로젝트 + 이미지 + 분석결과를 조인)
    const sql = `
            SELECT 
                p.title AS project_name,
                i.original_name AS page_name,
                ar.created_at AS analyzed_at
            FROM analysis_results ar
            JOIN images i ON ar.image_id = i.id
            JOIN projects p ON i.project_id = p.id
            WHERE p.user_id = ? 
            AND p.is_deleted = 0 
            AND i.is_deleted = 0
            ORDER BY ar.created_at DESC
        `;

    const rows = await db.query(sql, [userId]);

    const hist = rows.map((row) => ({
      date: formatDateTime(row.analyzed_at, userDateFormat),
      rawDate: row.analyzed_at, // [추가됨] 필터링을 위한 원본 날짜 데이터
      project: row.project_name,
      page: row.page_name,
    }));

    return res.render(
      "main/index",
      getUserContext(req, {
        content: "./history/history.ejs",
        title: "historyTitle",
        subtitle: "historySubtitle",
        history: hist,
      }),
      (e, content) => {
        if (e) console.error(e);
        res.end(content);
      }
    );
  } catch (err) {
    console.error("히스토리 라우터 에러", err);
    res.status(500).send("DB 에러 발생");
  }
});

module.exports = router;