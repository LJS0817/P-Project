<div align="center">
  <h1>👁️ P-Project: AI 아이트래킹 시뮬레이터</h1>
  <p><strong>디자인 시안을 분석하여 사용자 시선 집중도를 히트맵으로 시각화해주는 AI 기반 웹 서비스</strong></p>

  <!-- 방패 뱃지들 -->
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black" alt="EJS">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/AI_Used-10B981?style=for-the-badge" alt="AI 사용">
  <br><br>
</div>

## 📌 Project Overview
- **개발 기간:** 2025.11.24 ~ 2025.12.15 (약 3주)
- **개발 인원:** 5인 팀 (대학교 P-학기 프로젝트)
- **나의 역할:** 프론트엔드 전담 및 백엔드 로직 일부 보조
- **주요 기술:** Node.js, ejs, JavaScript, AI 머신러닝 모델 연동
- **기획/설계 (Figma):** [Figma 디자인 및 구조도 보러가기](https://www.figma.com/design/2l4fQf28Xc7AFqRdKkUM8g/%EC%A0%9C%EB%AA%A9-%EC%97%86%EC%9D%8C?node-id=0-1&t=jBQ0a2C4UdDLbA0b-1)

## 🎯 주요 특징 (Key Highlights)
1. **AI 기반 시선 예측:** 업로드된 디자인 시안 이미지를 AI 모델이 분석하여, 사용자가 어느 부분에 가장 먼저 시선을 빼앗기고 집중하는지를 계산합니다.
2. **히트맵 시각화:** 분석된 집중도 데이터를 직관적인 컬러 히트맵(Heatmap) 형태로 원본 이미지 위에 오버레이하여 시각화합니다.
3. **사용자 친화적 인터페이스:** 복잡한 과정 없이 이미지를 드래그 앤 드롭으로 업로드하고 즉시 결과를 확인할 수 있는 ejs 기반의 깔끔한 프론트엔드 UI를 구축했습니다.

---

## 🔥 팀업 & 트러블슈팅 (Challenge & Solution)

### 1. 팀원 간의 역량 차이 및 역할 분담 문제
**Problem:** 
프론트엔드를 함께 담당하기로 한 팀원이 프로젝트 실무 경험이 부족하여 컴포넌트 설계와 상태 관리를 진행하는 데 어려움을 겪었습니다. 또한, 백엔드를 담당한 팀장마저 전체 프로젝트의 일정 관리와 행정 업무(PM 역할)로 인해 실제 서버 API 및 로직 개발에 투자할 시간이 절대적으로 부족해지는 위기에 처했습니다.

**Solution:** 
일정이 매우 빠듯한 상황이었기 때문에, 경험이 부족한 팀원에게 억지로 진도를 강요하기보다는 현실적인 타협점을 찾았습니다.
1) **업무 재분배:** 제가 프론트엔드의 핵심 기능(아키텍처, 히트맵 렌더링, API 연동 등)을 주도적으로 모두 완성하고, 경험이 부족한 팀원에게는 레이아웃 배치, CSS 스타일링 보조 등 상대적으로 난이도가 낮지만 꼭 필요한 서브 태스크를 할당해 성취감을 느낄 수 있게 독려했습니다.
2) **백엔드 리소스 지원:** 팀장이 PM 업무에 집중할 수 있도록, 서버와 클라이언트를 연결하는 Node.js 라우터 설정 및 데이터 가공 로직 등 백엔드 작업 일부를 제가 자발적으로 넘겨받아 수행했습니다. 
결과적으로 제 작업량은 크게 늘었으나, 병목 현상을 해소하고 데드라인(12.15) 안에 성공적으로 프로젝트를 제출할 수 있었습니다.
