import requests

videos = requests.get("http://localhost:3000/videos").json()
print("Catálogo OTT:")
for v in videos:
    print(f"- {v['title']} [{v['drm']}] → {v['status']}")
