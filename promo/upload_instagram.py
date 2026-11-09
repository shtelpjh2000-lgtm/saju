"""인스타그램 릴스 자동 업로드 (Instagram API)

필요한 깃허브 Secrets: IG_ACCESS_TOKEN (필수), IG_USER_ID (선택, 없으면 me)
선택: IG_API_HOST (기본 graph.instagram.com, 페이스북 페이지 방식이면 graph.facebook.com)
      IG_API_VERSION (기본 v24.0)
없으면 업로드를 건너뛰어요.
사용: python upload_instagram.py out
"""
import os
import sys
import time

import requests


def main(outdir):
    token = os.environ.get("IG_ACCESS_TOKEN")
    if not token:
        print("인스타그램 설정이 아직 없어서 업로드를 건너뛰어요: IG_ACCESS_TOKEN")
        return
    host = os.environ.get("IG_API_HOST") or "graph.instagram.com"
    ver = os.environ.get("IG_API_VERSION") or "v24.0"
    uid = os.environ.get("IG_USER_ID") or "me"
    base = f"https://{host}/{ver}"
    video = os.path.join(outdir, "shorts.mp4")
    with open(os.path.join(outdir, "caption.txt"), encoding="utf-8") as f:
        caption = f.read().strip()[:2150]

    # 1) 릴스 상자 만들기 (영상 파일을 직접 올리는 방식)
    r = requests.post(f"{base}/{uid}/media", data={
        "media_type": "REELS", "upload_type": "resumable", "caption": caption,
        "share_to_feed": "true", "access_token": token}, timeout=60)
    r.raise_for_status()
    cid = r.json()["id"]

    # 2) 영상 올리기
    size = os.path.getsize(video)
    with open(video, "rb") as f:
        up = requests.post(f"https://rupload.facebook.com/ig-api-upload/{ver}/{cid}", data=f, headers={
            "Authorization": f"OAuth {token}", "offset": "0", "file_size": str(size)}, timeout=300)
    up.raise_for_status()

    # 3) 처리 끝날 때까지 기다리기
    for _ in range(60):
        s = requests.get(f"{base}/{cid}", params={"fields": "status_code,status", "access_token": token},
                         timeout=30).json()
        code = s.get("status_code")
        if code == "FINISHED":
            break
        if code in ("ERROR", "EXPIRED"):
            raise SystemExit(f"인스타그램 영상 처리 실패: {s}")
        time.sleep(10)
    else:
        raise SystemExit("인스타그램 영상 처리가 너무 오래 걸려요")

    # 4) 게시
    p = requests.post(f"{base}/{uid}/media_publish", data={"creation_id": cid, "access_token": token}, timeout=60)
    p.raise_for_status()
    print("인스타그램 릴스 게시 완료:", p.json().get("id"))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "out")
