# 운세 쇼츠 자동 업로드 설정 방법

매일 아침 7시쯤 GitHub가 "오늘의 띠별 운세" 영상을 만들어요.
그리고 아래 열쇠(Secret)가 있는 곳에만 자동으로 올려요.
열쇠가 없는 곳은 그냥 건너뛰고, 영상은 Releases(보관함)에 계속 쌓여요.

열쇠는 모두 여기에 넣어요:
**저장소 → Settings → Secrets and variables → Actions → New repository secret**

| 이름 | 어디에 쓰나 |
|---|---|
| `YT_CLIENT_ID` | 유튜브 |
| `YT_CLIENT_SECRET` | 유튜브 |
| `YT_REFRESH_TOKEN` | 유튜브 |
| `IG_ACCESS_TOKEN` | 인스타그램 |
| `IG_USER_ID` | 인스타그램 (선택) |
| `GH_PAT` | 인스타 토큰 자동 연장용 |

---

## A. 유튜브 쇼츠

1. **console.cloud.google.com** 에 유튜브 채널이 있는 구글 계정으로 로그인해요. 그다음 새 프로젝트를 만들어요(이름 예: `cheongi-shorts`).
2. **API 및 서비스 → 라이브러리**에서 `YouTube Data API v3`를 찾아 **사용**을 눌러요.
3. **OAuth 동의 화면**(Google 인증 플랫폼)으로 가요.
   - 사용자 유형은 **외부**로, 앱 이름은 `천기 쇼츠`로 하고 이메일을 넣어요.
   - **대상(Audience)에서 게시 상태를 "프로덕션으로 푸시"로 바꿔요.**
     "테스트" 상태로 두면 7일마다 열쇠가 만료돼서 업로드가 멈춰요.
4. **사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**를 눌러요.
   - 애플리케이션 유형은 **웹 애플리케이션**으로 해요.
   - 승인된 리디렉션 URI에 `https://developers.google.com/oauthplayground` 를 넣어요.
   - 만들어진 **클라이언트 ID**는 `YT_CLIENT_ID`, **클라이언트 보안 비밀번호**는 `YT_CLIENT_SECRET`이에요.
5. **developers.google.com/oauthplayground** 에 들어가요.
   - 오른쪽 위 톱니바퀴를 눌러 **Use your own OAuth credentials**에 체크하고, 4번의 ID와 비밀번호를 넣어요.
   - 왼쪽 아래 입력칸에 `https://www.googleapis.com/auth/youtube.upload` 를 넣고 **Authorize APIs**를 눌러요.
   - 채널 계정을 고르고, "확인되지 않은 앱" 경고가 나오면 **고급 → (안전하지 않음)으로 이동 → 허용**을 눌러요.
   - **Exchange authorization code for tokens**를 누르면 나오는 **Refresh token**이 `YT_REFRESH_TOKEN`이에요.
6. ⚠️ **꼭 알아 둘 점:** 구글 심사(감사)를 받기 전에는 API로 올린 영상이 **비공개로 고정**돼요.
   공개로 올리려면 YouTube API 감사 신청서를 내야 해요: https://support.google.com/youtube/contact/yt_api_form
   (용도: "내 채널에 매일 자체 제작한 운세 쇼츠 1개를 자동 업로드". 결과가 나오기까지 몇 주 걸릴 수 있어요.)
   승인 전까지는 Releases에 쌓인 영상을 받아서 유튜브 앱으로 직접 올리면 돼요.

## B. 인스타그램 릴스

1. 인스타그램 앱에서 **설정 → 계정 유형 및 도구 → 프로페셔널 계정으로 전환**해요(크리에이터 추천).
2. **developers.facebook.com → 내 앱 → 앱 만들기**를 눌러요.
   사용 사례는 **"Instagram에서 메시지 및 콘텐츠 관리"**(Instagram API)를 골라요.
3. 앱 대시보드에서 **Instagram → Instagram 로그인을 통한 API 설정**으로 가요.
   - **액세스 토큰 생성**에서 내 인스타 계정을 추가하고 로그인해요.
   - 테스터 초대를 수락하라는 안내가 나오면, 인스타 웹의 **설정 → 앱 및 웹사이트 → 테스터 초대**에서 수락해요.
   - 생성된 토큰이 `IG_ACCESS_TOKEN`이에요. 같은 화면에 나오는 숫자 ID는 `IG_USER_ID`예요(선택).
4. 내 계정에 올리는 용도라서 앱 심사 없이도 바로 쓸 수 있어요.

## C. 인스타 토큰 자동 연장 (GH_PAT)

인스타 토큰은 60일이 지나면 만료돼요. 워크플로가 매일 토큰을 연장하는데, 새 토큰이 나오면 Secret을 바꿔야 해서 이 열쇠가 필요해요.

1. **github.com/settings/personal-access-tokens** 에서 **Generate new token**(Fine-grained)을 눌러요.
2. Repository access는 **Only select repositories → saju**로 해요.
3. Permissions에서 **Secrets: Read and write**를 골라요.
4. 만료 기간은 1년 정도로 정하고, 만든 토큰을 `GH_PAT` Secret에 넣어요.

## D. 바로 시험해 보기

**저장소 → Actions → "운세 쇼츠 만들고 올리기" → Run workflow**를 누르면 지금 바로 한 번 돌아가요.
로그에 "유튜브 업로드 완료"나 "인스타그램 릴스 게시 완료"가 나오면 성공이에요.

## 앱이 출시되면

`promo/config.json`의 `app_link`에 플레이스토어 주소를 넣어요.
그러면 영상 마지막 화면이 "곧 출시"에서 "프로필 링크에서 받기"로 바뀌고, 영상 설명에 링크가 붙어요.
