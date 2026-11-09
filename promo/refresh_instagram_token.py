"""인스타그램 토큰 자동 연장

인스타그램 장기 토큰은 60일이 지나면 만료돼요.
이 스크립트가 매일 토큰을 연장하고, 새 토큰을 new_token.txt 파일에 써 둬요.
그다음 워크플로가 그 파일로 깃허브 Secret(IG_ACCESS_TOKEN)을 바꿔요. 이때 GH_PAT가 필요해요.
토큰 값은 화면(로그)에 절대 출력하지 않아요.

사용: python refresh_instagram_token.py new_token.txt
"""
import os
import sys

import requests


def main(out_path):
    token = os.environ.get("IG_ACCESS_TOKEN")
    if not token:
        print("인스타그램 토큰이 없어서 연장을 건너뛰어요")
        return
    host = os.environ.get("IG_API_HOST") or "graph.instagram.com"
    if host != "graph.instagram.com":
        # 페이스북 페이지 방식의 페이지 토큰은 만료되지 않아서 연장할 필요가 없어요
        print("페이스북 페이지 방식이라 토큰 연장이 필요 없어요")
        return
    r = requests.get(f"https://{host}/refresh_access_token",
                     params={"grant_type": "ig_refresh_token", "access_token": token}, timeout=30)
    if r.status_code != 200:
        print("토큰 연장 실패 (다음 날 다시 시도해요):", r.status_code, r.text[:200].replace(token, "***"))
        return
    data = r.json()
    new = data.get("access_token")
    days = int(data.get("expires_in", 0)) // 86400
    print(f"인스타그램 토큰 연장 완료: 앞으로 약 {days}일 동안 쓸 수 있어요")
    if new and new != token:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(new)
        print("새 토큰이 발급돼서 Secret을 바꿀게요")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "new_token.txt")
