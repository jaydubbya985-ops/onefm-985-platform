"""Brand an interview clip for socials: intro card + framed clip with lower-third + Grand Final tease.

Usage: python3 onefm_video.py clips/<file>.json
JSON: {name, src, speaker, role, sponsor_logo (optional), match_line, tease:{script,big,line1,line2},
       formats:["9x16","1x1"]}
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onefm_tile import (A, BG, PANEL, GOLD, WHITE, GREY, LIGHT_CHIP, anton, bar, load, paste, stripes,
                        gold_text, script_over, sponsor_strip)

HERE = os.path.dirname(os.path.abspath(__file__))
SIZES = {"9x16": (1080, 1920), "1x1": (1080, 1080)}

def canvas(W, H):
    img = Image.new("RGB", (W, H), BG); stripes(img); return img

def frame(c, W, H, vid_h):
    """Static overlay: everything except the video window (returned as RGBA with a hole)."""
    img = canvas(W, H).convert("RGBA"); d = ImageDraw.Draw(img)
    top = (H - vid_h) // 2 - (60 if H > W else 0)
    lg = load("onefm_white.png", (200, 92)); paste(img, lg, ((W - lg.width) // 2, 30))
    d = ImageDraw.Draw(img)
    d.text((W / 2, 150), "   ".join(c["league"].upper()), font=bar(600, 22), fill=GOLD, anchor="mm")
    d.text((W / 2, top - 30), c["match_line"].upper(), font=bar(700, 30), fill=WHITE, anchor="mm")
    # video window (transparent) with gold border
    d.rectangle([0, top, W, top + vid_h], fill=(0, 0, 0, 0))
    d.rectangle([0, top - 3, W, top], fill=GOLD); d.rectangle([0, top + vid_h, W, top + vid_h + 3], fill=GOLD)
    # lower-third under the window
    ly = top + vid_h + 28
    d.rounded_rectangle([40, ly, W - 40, ly + 110], radius=12, fill=PANEL, outline=GOLD, width=2)
    d.rectangle([40, ly, 52, ly + 110], fill=GOLD)
    d.text((76, ly + 22), c["speaker"].upper(), font=anton(44), fill=WHITE)
    d.text((76, ly + 74), c["role"].upper(), font=bar(600, 24), fill=GOLD)
    if c.get("sponsor_logo"):
        d.rounded_rectangle([W - 60 - 170, ly + 22, W - 60, ly + 88], radius=8, fill=LIGHT_CHIP)
        sl = load("sponsors/" + c["sponsor_logo"], (150, 50)); paste(img, sl, (W - 60 - 170 + (170 - sl.width) // 2, ly + 22 + (66 - sl.height) // 2))
    d = ImageDraw.Draw(img)
    if H > W:
        sponsor_strip(img, H - 190, H - 122, label_y=H - 208)
        d = ImageDraw.Draw(img)
        d.text((W / 2, H - 78), "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM.", font=bar(700, 26), fill=GOLD, anchor="mm")
    else:
        d.text((W / 2, H - 40), "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM 98.5", font=bar(700, 24), fill=GOLD, anchor="mm")
    return img, top

def intro(c, W, H):
    img = canvas(W, H); mid = H // 2
    lg = load("onefm_white.png", (300, 140)); paste(img, lg, ((W - lg.width) // 2, mid - 330))
    d = ImageDraw.Draw(img)
    d.text((W / 2, mid - 150), "   ".join(c["league"].upper()), font=bar(600, 24), fill=GOLD, anchor="mm")
    size = 150
    while d.textlength(c["intro_big"].upper(), font=anton(size)) > W - 120: size -= 5
    gold_text(img, (W / 2, mid + 40), c["intro_big"].upper(), anton(size), anchor="ms")
    script_over(img, (W / 2 - 10, mid - 70), c.get("intro_script", "Full Time"), 96)
    d = ImageDraw.Draw(img)
    d.text((W / 2, mid + 110), c["match_line"].upper(), font=bar(700, 34), fill=WHITE, anchor="mm")
    d.text((W / 2, mid + 170), (c["speaker"] + "  •  " + c["role"]).upper(), font=bar(600, 26), fill=GREY, anchor="mm")
    return img

def outro(c, W, H):
    t = c["tease"]; img = canvas(W, H); mid = H // 2
    lg = load("onefm_white.png", (300, 140)); paste(img, lg, ((W - lg.width) // 2, mid - 380))
    d = ImageDraw.Draw(img)
    size = 190
    while d.textlength(t["big"].upper(), font=anton(size)) > W - 100: size -= 5
    gold_text(img, (W / 2, mid + 20), t["big"].upper(), anton(size), anchor="ms")
    script_over(img, (W / 2 - 10, mid - 175), t["script"], 110)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([60, mid + 60, W - 60, mid + 200], radius=16, fill=PANEL, outline=GOLD, width=2)
    if t.get("home_logo") and t.get("away_logo"):
        hl = load("clubs/" + t["home_logo"], (90, 90)); al = load("clubs/" + t["away_logo"], (90, 90))
        paste(img, hl, (84, mid + 85)); paste(img, al, (W - 84 - al.width, mid + 85)); d = ImageDraw.Draw(img)
    d.text((W / 2, mid + 130), t["line1"].upper(), font=bar(800, 44), fill=WHITE, anchor="mm")
    d.text((W / 2, mid + 240), t["line2"].upper(), font=bar(600, 30), fill=GREY, anchor="mm")
    d.text((W / 2, mid + 300), "LIVE ON ONE FM 98.5", font=anton(48), fill=GOLD, anchor="mm")
    if H > W: sponsor_strip(img, H - 190, H - 122, label_y=H - 208)
    return img

def run(cmd): subprocess.run(cmd, check=True)

def build(c):
    out_dir = os.path.join(HERE, "out"); os.makedirs(out_dir, exist_ok=True); tmp = os.path.join(HERE, "tmp"); os.makedirs(tmp, exist_ok=True)
    src = c["src"] if os.path.isabs(c["src"]) else os.path.join(HERE, c["src"])
    fps, vw, vh = 30, 1080, 0
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip().split(",")
    sw, sh = int(probe[0]), int(probe[1]); vid_h = int(round(1080 * sh / sw / 2) * 2)
    for fmt in c.get("formats", ["9x16"]):
        W, H = SIZES[fmt]
        fr, top = frame(c, W, H, vid_h); fr_p = os.path.join(tmp, f"frame_{fmt}.png"); fr.save(fr_p)
        in_p = os.path.join(tmp, f"intro_{fmt}.png"); intro(c, W, H).save(in_p)
        out_p = os.path.join(tmp, f"outro_{fmt}.png"); outro(c, W, H).save(out_p)
        final = os.path.join(out_dir, f'{c["name"]}_{fmt}.mp4')
        fc = (
            f"[0:v]scale={W}:{H},format=yuv420p,fps={fps},loop=loop=-1:size=1:start=0,trim=duration={c.get('intro_s',1.8)},"
            f"fade=t=out:st={c.get('intro_s',1.8)-0.3}:d=0.3,setpts=PTS-STARTPTS[intro];"
            f"[2:v]scale={vw}:{vid_h},fps={fps},setpts=PTS-STARTPTS[clip];"
            f"color=c=#0b0b12:s={W}x{H}:r={fps}[bg];[bg][clip]overlay=0:{top}:shortest=1[base];"
            f"[base][1:v]overlay=0:0:format=auto,format=yuv420p[main];"
            f"[3:v]scale={W}:{H},format=yuv420p,fps={fps},loop=loop=-1:size=1:start=0,trim=duration={c.get('outro_s',4)},"
            f"fade=t=in:st=0:d=0.4,setpts=PTS-STARTPTS[outro];"
            f"anullsrc=r=48000:cl=stereo,atrim=duration={c.get('intro_s',1.8)}[ai];"
            f"[2:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS[ac];"
            f"anullsrc=r=48000:cl=stereo,atrim=duration={c.get('outro_s',4)}[ao];"
            f"[intro][ai][main][ac][outro][ao]concat=n=3:v=1:a=1[v][a]"
        )
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", in_p, "-i", fr_p, "-i", src, "-loop", "1", "-i", out_p,
             "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", final])
        print("wrote", final)

if __name__ == "__main__":
    for p in sys.argv[1:]:
        build(json.load(open(p)))
