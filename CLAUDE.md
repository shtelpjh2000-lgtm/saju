# 도깨비 사주 (홍연기문 명국 앱)

한국어 사용자용 웹앱 + 안드로이드 앱(Capacitor). 사용자는 비개발자 — 답은 쉬운 한국어로, 결과 위주로.

## 구조
- `www/index.html` 화면 뼈대, `www/css/app.css` 스타일, `www/css/extra.css` 새 화면 조각(첫 화면 카드·그림·방망이 달·큰 시간 글씨)을 처음 분홍·보라 스타일에 맞춘 것, `www/fonts/` 프리텐다드 글꼴(SIL OFL, 앱에 넣어 둠 — 전체 글씨는 이 글꼴, 한자 칸만 명조), `www/img/art/` 김홍도 풍속화 삽화(공공 저작물, `ART`/`artFig` in 05-app.js)
- `www/js/01-lunar.js` 만세력 라이브러리(lunar-javascript, 수정 금지)
- `www/js/02-gimun.js` **명국 계산**(국·홍국수·연국·태을·생기복덕·대운 나이·12운성) — `Gimun.calc` (칸 신살 `salE`/`salH` 포함)
- `www/js/03-haeseok.js` **풀이**(왕쇠·용신·진용·합 순열·살·원국비기·신수·일진) — `Haeseok.*`
- `www/js/04-saju4.js` 사주 4주 풀이·기질 유형
- `www/js/05-app.js` 화면 동작 전부(입력, 메뉴, 궁합, 작명, 해몽, 도깨비 대화, 알림, 공유)
- `www/js/06-simple.js` 쉬운 보기(전문가 보기는 사용자 요청으로 없앰: pro는 늘 false, 저장값 지움), `www/js/07-qa.js` "궁금한 것 누르기" 질문 목록 + 맨 위 `#heroCard`(05-app.js `heroHtml`: 올해 별명·찌르는 첫마디·예고 D-day·공유 그림, 예고는 localStorage `hongmyeongguk.yeogo` → 알림)
- 사람 끌기(05-app.js heroHtml 근처): 지난 일 맞히기 `pastList`/`.hPast`(지난 12달 중 약했던 달, 계절로만), 오늘의 방망이 `bokHtml`(localStorage `hongmyeongguk.bok` 이어 온 날·엽전), 도깨비 부적 `bjCanvas`(올해 제일 약한 일), 우리 집 서열 `famScores`(서열 칸 안 "가족 넣기"로 바로 추가·✕로 빼기, 이름 넣고 본 사람도 저장 목록에 자동 저장, 계산 때 `base`를 잠깐 바꿈), 궁합 링크 `?with=`(받은 사람이 생일 넣으면 궁합 탭으로), 운 보기 누르면 방망이 세 번 두드리는 화면 `ttak`, 작명은 먼저 전문가 설명 `jmIntro`를 따로 한 장 `#jmIntroOv`로(이름 지으러 가기 누르면 입력 화면, ← 돌아가기는 타고난 운으로) → 좋은 이름 받기 누르면 구궁도(궁 이름 한자·괘)·오행 짓는 화면 `#jmAnim` 약 5초 뒤 결과(테스트는 둘 다 `window.__noTtak=true`로 건너뜀). 작명은 이름 받기만(이름 풀이 탭은 사용자 요청으로 뺌). 작명증서 도장은 한자 `獨脚鬼作名硏究所印`, 해석 장엔 도장 없음
- 도깨비 대화: 🎤 `#askMic` 말로 묻기(앱은 `@capacitor-community/speech-recognition`, 마이크 권한은 build.yml에서 매니페스트에 넣음; 웹은 브라우저 음성 인식). 대답은 짧게: 첫마디(질문 속 사람 되짚기 `SUBJ`) → 결론 → 왜냐면 2문장 → 📅 때(필요할 때만) → 방향(이사·부동산·여행만) → 💡 도깨비의 한 수
- 현실 장면 `SCENE`/`sceneOf`(05-app.js 끝): 주제 묶음(돈·가게·집·일·공부·인연·부부·자녀·건강·사람·전체)×좋음/어려움×나이대(35 아래/35~54/55 이상) 생활 장면 문장(새로 쓴 것, 블로그 글 옮기지 않음). 도깨비 대답 결론 바로 밑 '🎬 이런 일 생기기 쉽네', 질문 목록 대답, 올해 운세 분야별 줄 밑에 붙음. 점수 0.37 이상이면 좋은 장면. 자식 질문은 자식 쪽 장면, 시댁·처가는 성별로
- 올해 운세 맨 위 `__yearCard`: 띠·한 해 이름(`YKEY`)·별점·다른 해와 분야별 ▲▼ 비교. 올해가 아닌 해는 '올해' 대신 'NNNN년'
- 스크립트는 일반 `<script>`라 전역 변수(`base`, `mode`, `show`, `render`, `$`)를 서로 씀. 순서 바꾸지 말 것.
- 규칙 근거: `docs/운곡-규칙-요약.md`, 대조 기록·미해결: `docs/참고자료.md`

## 검사 (고친 뒤 꼭)
- `node tests/check.js` — 운곡 화면 15명 명국 값 1965칸 일치 + 무작위 500명 풀이 오류 없음
- `node tests/book.js` — 「기문둔갑 원칙」 예시 명국 12개와 책 결론(용신·진용·개운·대운 살성 등) 대조
- `node tests/browser.js` — 실제 화면(음력 입력·질문 열기·모든 탭·전문가 보기) 오류 없음
- 계산을 일부러 바꿨고 화면과 다시 맞췄을 때만 `node tests/make-fixture.js`로 기준값 갱신

## 배포
- `main`에 push하면 GitHub Pages(웹)와 Actions "앱 만들기 (APK)"가 자동 실행, 릴리스 `vNN`에 `hongmyeongguk.apk`가 올라감.
- 웹: https://shtelpjh2000-lgtm.github.io/saju/ , 앱: https://github.com/shtelpjh2000-lgtm/saju/releases
- 진행 확인은 REST만 됨(`gh api repos/shtelpjh2000-lgtm/saju/actions/runs`, `.../releases`). GraphQL(`gh run watch`, `gh release list`)은 막혀 있음.

## 주의
- 저장소는 공개. 원고(HWP) 원문, 프로그램 화면 이미지, 이름 같은 개인정보는 넣지 않음.
- 시간 보정은 앱 `autoAdjust`(표준시 −30분 등)를 따름.
- `index.html`의 `__APPVER__`는 앱 만들기에서 `vNN`으로 바뀜(화면 파일 캐시 깨기 + 제목 옆 버전 표시). 웹에서는 "웹"으로 보임.
- 입력 화면의 결혼·자녀·하는 일 칸은 사용자 요청으로 뺐음(값은 비어 나이로 짐작). 결혼·자녀·하는 일(`input.mar/kid/job`, 05-app.js `lifeCtx`·`fitProf`·`profLine`/`kidLine`(요약·한마디로·첫 화면)·나이별 흐름 묶음(PHB 사업·PHSt 학생·PHSk 구직·PHKP 자녀 계획·PHKJ 아랫사람)·질문 주제 바꾸기 `profNote`)은 풀이 문장 고르기에만 씀(계산은 안 바뀜). 쉬운 보기·전문가 보기 모두 지난 나이·달·해·날을 보여 주지 않음(나이별 흐름·10년 운 표·달별 운·연도/날짜 넘기기·나이 고르기). 입력 없으면 40세부터 기혼, 50세부터 손주, 65세부터 활동으로 봄(칸 나이 기준).
