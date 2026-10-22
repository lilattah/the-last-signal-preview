#!/usr/bin/env python3
"""Fetch YouTube metadata server-side; API key never enters public JavaScript."""
import json, os, re, sys
from pathlib import Path
from urllib.parse import urlencode, urlparse, parse_qs
from urllib.request import urlopen
url = sys.argv[1]
slot = sys.argv[2]
if slot not in ("part-00","part-01"):
    raise SystemExit("Invalid episode ID")
p=urlparse(url)
if p.hostname not in ("youtube.com","www.youtube.com","m.youtube.com","youtu.be"):
    raise SystemExit("Unsupported YouTube URL")
vid = p.path.strip("/") if p.hostname=="youtu.be" else (parse_qs(p.query).get("v") or [p.path.split("/")[-1]])[0]
if not re.fullmatch(r"[A-Za-z0-9_-]{11}",vid): raise SystemExit("Invalid video ID")
key=os.environ.get("YOUTUBE_API_KEY")
if not key: raise SystemExit("Missing YOUTUBE_API_KEY repository secret")
query=urlencode({"part":"snippet,contentDetails","id":vid,"key":key})
with urlopen("https://www.googleapis.com/youtube/v3/videos?"+query,timeout=20) as resp: data=json.load(resp)
if not data.get("items"): raise SystemExit("Video not accessible to YouTube Data API")
v=data["items"][0]; sn=v["snippet"]; thumbnails=sn.get("thumbnails",{})
thumb=(thumbnails.get("maxres") or thumbnails.get("standard") or thumbnails.get("high") or thumbnails.get("medium") or thumbnails.get("default") or {}).get("url","")
out=Path("youtube-data.js")
existing={}
if out.exists():
    match=re.search(r"window\\.TLS_YOUTUBE_DATA\\s*=\\s*(\\{.*\\});?\\s*$",out.read_text(),re.S)
    if match: existing=json.loads(match.group(1))
existing[slot]={"title":sn.get("title",""),"description":sn.get("description",""),"thumbnail":thumb,"publishedAt":sn.get("publishedAt",""),"duration":v.get("contentDetails",{}).get("duration",""),"video":"https://www.youtube.com/watch?v="+vid,"youtubeId":vid}
out.write_text("window.TLS_YOUTUBE_DATA = "+json.dumps(existing,ensure_ascii=False,indent=2)+";\\n",encoding="utf-8")
print("Synced",slot,vid)
