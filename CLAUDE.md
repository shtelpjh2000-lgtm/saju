# 도깨비 사주 (홍연기문 명국 앱)

한국어 사용자용 웹앱 + 안드로이드 앱(Capacitor). 사용자는 비개발자 — 답은 쉬운 한국어로, 결과 위주로.

## 구조
- `www/index.html` 화면 뼈대, `www/css/app.css` 스타일
- `www/js/01-lunar.js` 만세력 라이브러리(lunar-javascript, 수정 금지)
- `www/js/02-gimun.js` **명국 계산**(국·홍국수·연국·태을·생기복덕·대운 나이·12운성) — `Gimun.calc`
- `www/js/03-haeseok.js` **풀이**(왕쇠·용신·진용·합 순열·살·원국비기·신수·일진) — `Haeseok.*`
- `www/js/04-saju4.js` 사주 4주 풀이·기질 유형
- `www/js/05-app.js` 화면 동작 전부(입력, 메뉴, 궁합, 작명, 해몽, 도깨비 대화, 알림, 공유)
- `www/js/06-simple.js` 쉬운 보기/전문가 보기 스위치, `www/js/07-qa.js` "궁금한 것 누르기" 질문 목록
- 스크립트는 일반 `<script>`라 전역 변수(`base`, `mode`, `show`, `render`, `$`)를 서로 씀. 순서 바꾸지 말 것.
- 규칙 근거: `docs/운곡-규칙-요약.md`, 대조 기록·미해결: `docs/참고자료.md`

## 검사 (고친 뒤 꼭)
- `node tests/check.js` — 운곡 화면 15명 명국 값 1965칸 일치 + 무작위 500명 풀이 오류 없음
- `node tests/browser.js` — 실제 화면(음력 입력·질문 열기·모든 탭·전문가 보기) 오류 없음
- 계산을 일부러 바꿨고 화면과 다시 맞췄을 때만 `node tests/make-fixture.js`로 기준값 갱신

## 배포
- `main`에 push하면 GitHub Pages(웹)와 Actions "앱 만들기 (APK)"가 자동 실행, 릴리스 `vNN`에 `hongmyeongguk.apk`가 올라감.
- 웹: https://shtelpjh2000-lgtm.github.io/saju/ , 앱: https://github.com/shtelpjh2000-lgtm/saju/releases
- 진행 확인은 REST만 됨(`gh api repos/shtelpjh2000-lgtm/saju/actions/runs`, `.../releases`). GraphQL(`gh run watch`, `gh release list`)은 막혀 있음.

## 주의
- 저장소는 공개. 원고(HWP) 원문, 프로그램 화면 이미지, 이름 같은 개인정보는 넣지 않음.
- 시간 보정은 앱 `autoAdjust`(표준시 −30분 등)를 따름.
