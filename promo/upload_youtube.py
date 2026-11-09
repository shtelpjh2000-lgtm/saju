"""유튜브 쇼츠 자동 업로드

필요한 깃허브 Secrets: YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
없으면 업로드를 건너뛰어요.
사용: python upload_youtube.py out
"""
import os
import sys

REQUIRED = ["YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"]


def main(outdir):
    missing = [k for k in REQUIRED if not os.environ.get(k)]
    if missing:
        print("유튜브 설정이 아직 없어서 업로드를 건너뛰어요:", ", ".join(missing))
        return
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    creds = Credentials(
        None,
        refresh_token=os.environ["YT_REFRESH_TOKEN"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ["YT_CLIENT_ID"],
        client_secret=os.environ["YT_CLIENT_SECRET"],
        scopes=["https://www.googleapis.com/auth/youtube.upload"],
    )
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
    with open(os.path.join(outdir, "title.txt"), encoding="utf-8") as f:
        title = f.read().strip()[:100]
    with open(os.path.join(outdir, "caption.txt"), encoding="utf-8") as f:
        desc = f.read().strip()[:4900]
    body = {
        "snippet": {
            "title": title,
            "description": desc,
            "tags": ["오늘의운세", "띠별운세", "운세", "사주", "일진", "shorts"],
            "categoryId": "24",
            "defaultLanguage": "ko",
        },
        "status": {
            "privacyStatus": os.environ.get("YT_PRIVACY", "public"),
            "selfDeclaredMadeForKids": False,
        },
    }
    media = MediaFileUpload(os.path.join(outdir, "shorts.mp4"), mimetype="video/mp4", resumable=True)
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    vid = resp["id"]
    print("유튜브 업로드 완료: https://youtube.com/shorts/" + vid)
    thumb = os.path.join(outdir, "thumb.jpg")
    if os.path.exists(thumb):
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(thumb, mimetype="image/jpeg")).execute()
        except Exception as e:  # 쇼츠는 썸네일 지정이 안 될 수도 있어요
            print("썸네일은 건너뛰었어요:", e)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "out")
