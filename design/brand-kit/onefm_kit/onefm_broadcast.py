"""ONE FM full-frame broadcast overlay (16:9) — matches the approved demonstration.

Usage: python3 onefm_broadcast.py clips/<file>.json
Timeline: bug fades in at 0.3 s | title lower-third slides in 1.0–7.0 s | speaker lower-third 7.5–14 s |
          static bug through the body | score strip slides up for the final 9 s | fade out.
JSON keys: name, src, start, end (optional), league_tag, title, match_line, speaker, role,
           sponsor_logo (optional), home/away {name, logo, score, detail, winner}, result_label
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onefm_tile import A, BG, PANEL, GOLD, WHITE, GREY, LIGHT_CHIP, anton, bar, vibes, load, paste, stripes, gold_text, script_over, sponsor_strip

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1920, 1080, 30
NAVY = (14, 22, 46); NAVY_A = NAVY + (225,)
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2"]

def ease(t0, d): return f"(1-pow(1-min(max((t-{t0})/{d},0),1),3))"
def ease_in(t0, d): return f"pow(min(max((t-{t0})/{d},0),1),3)"
def run(cmd): subprocess.run(cmd, check=True)
def probe_dur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip())
def rgba(w, h): return Image.new("RGBA", (w, h), (0, 0, 0, 0))

# ------------------------------------------------------------------ elements
def bug():
    lg = load("onefm_white.png", (210, 96)); w, h = lg.width + 40, lg.height + 28; img = rgba(w, h)
    ImageDraw.Draw(img).rounded_rectangle([0, 0, w - 1, h - 1], radius=12, fill=NAVY + (200,))
    paste(img, lg, (20, 14)); return img

def lower_third(tag, line1, line2, sponsor=None, w=820):
    h = 150; img = rgba(w, h); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 30, w - 1, h - 1], radius=10, fill=NAVY_A)
    d.rectangle([0, 30, 10, h], fill=GOLD)
    tw = d.textlength(tag.upper(), font=bar(700, 18)) + 28
    d.rounded_rectangle([0, 0, tw, 30], radius=6, fill=GOLD); d.text((14, 15), tag.upper(), font=bar(700, 18), fill=NAVY, anchor="lm")
    d.text((32, 52), line1.upper(), font=anton(48), fill=WHITE)
    d.text((32, 110), line2.upper(), font=bar(600, 24), fill=GOLD)
    if sponsor:
        d.rounded_rectangle([w - 24 - 170, 60, w - 24, 126], radius=8, fill=LIGHT_CHIP)
        sl = load("sponsors/" + sponsor, (150, 50)); paste(img, sl, (w - 24 - 170 + (170 - sl.width) // 2, 60 + (66 - sl.height) // 2))
    return img

def score_strip(c):
    h, a = c["home"], c["away"]; w, hh = W - 80 - 270, 120; img = rgba(w, hh); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, hh - 1], radius=10, fill=NAVY_A); d.rectangle([0, 0, 10, hh], fill=GOLD)
    d.text((34, hh / 2), c.get("result_label", "FULL TIME").upper(), font=bar(700, 24), fill=GOLD, anchor="lm")
    x = 440
    hl = load("clubs/" + h["logo"], (84, 84)); al = load("clubs/" + a["logo"], (84, 84))
    paste(img, hl, (x, (hh - hl.height) // 2)); d = ImageDraw.Draw(img); x += 100
    d.text((x, hh / 2 - 18), h["name"].upper(), font=bar(800, 34), fill=WHITE, anchor="lm"); d.text((x, hh / 2 + 22), h.get("detail", ""), font=bar(600, 22), fill=GREY, anchor="lm")
    d.text((x + 330, hh / 2), str(h["score"]), font=anton(66), fill=GOLD if h.get("winner") else WHITE, anchor="rm")
    d.text((x + 400, hh / 2), "DEF" if h.get("winner") else "V", font=bar(700, 24), fill=GOLD, anchor="mm")
    d.text((x + 470, hh / 2), str(a["score"]), font=anton(66), fill=GOLD if a.get("winner") else WHITE, anchor="lm")
    x2 = x + 600
    paste(img, al, (x2, (hh - al.height) // 2)); d = ImageDraw.Draw(img); x2 += 100
    d.text((x2, hh / 2 - 18), a["name"].upper(), font=bar(800, 34), fill=WHITE, anchor="lm"); d.text((x2, hh / 2 + 22), a.get("detail", ""), font=bar(600, 22), fill=GREY, anchor="lm")
    return img

def card(c, script, big, sub, sponsor=None, strip=False):
    img = Image.new("RGB", (W, H), BG); stripes(img); d = ImageDraw.Draw(img); mid = H // 2
    lg = load("onefm_white.png", (240, 110)); paste(img, lg, ((W - lg.width) // 2, mid - 360)); d = ImageDraw.Draw(img)
    d.text((W / 2, mid - 220), "   ".join(c.get("league_line", c.get("match_line", "")).upper()), font=bar(600, 24), fill=GOLD, anchor="mm")
    size = 170
    while d.textlength(big.upper(), font=anton(size)) > W - 240: size -= 5
    gold_text(img, (W / 2, mid + 85), big.upper(), anton(size), anchor="ms"); script_over(img, (W / 2 - 10, mid - 120), script, 104)
    d = ImageDraw.Draw(img); d.text((W / 2, mid + 140), sub.upper(), font=bar(700, 32), fill=WHITE, anchor="mm")
    if sponsor:
        cw, ch = 340, 90; x0, y0 = (W - cw) // 2, mid + 180
        d.rounded_rectangle([x0, y0, x0 + cw, y0 + ch], radius=12, fill=LIGHT_CHIP)
        sl = load("sponsors/" + sponsor, (cw - 40, ch - 24)); paste(img, sl, (x0 + (cw - sl.width) // 2, y0 + (ch - sl.height) // 2))
    if strip:
        # sponsor strip sized for 16:9: six chips across the middle
        sponsor_strip(img, H - 130, H - 62, label_y=H - 148)
    return img

# ------------------------------------------------------------------ build
def build(c):
    tmp = os.path.join(HERE, "tmp", "bc"); os.makedirs(tmp, exist_ok=True); out_dir = os.path.join(HERE, "out"); os.makedirs(out_dir, exist_ok=True)
    src = c["src"] if os.path.isabs(c["src"]) else os.path.join(HERE, c["src"])
    start = float(c.get("start", 0)); end = float(c.get("end") or probe_dur(src))
    if c.get("cuts"):  # [[from,to],...] seconds to remove; produces a clean intermediate
        keep = []; cur = start
        for a, b in c["cuts"]:
            if a > cur: keep.append((cur, a))
            cur = max(cur, b)
        if end > cur: keep.append((cur, end))
        parts_ = []
        for i, (a, b) in enumerate(keep):
            pp = f"{tmp}/seg{i}.mp4"
            run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", str(b - a), "-i", src, "-vf", f"fps={FPS}", "-af", "aresample=48000", *ENC, pp]); parts_.append(pp)
        lst_ = f"{tmp}/cut_list.txt"; open(lst_, "w").write("".join(f"file '{p}'\n" for p in parts_))
        clean = f"{tmp}/clean_{c['name']}.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst_, "-c", "copy", clean])
        src = clean; start = 0.0; end = probe_dur(clean)
    total = end - start
    bg_ = bug(); bg_p = f"{tmp}/bug.png"; bg_.save(bg_p)
    lt1 = lower_third(c.get("league_tag", "ONE FM Football"), c.get("title", "Post-match interview"), c["match_line"]); lt1_p = f"{tmp}/lt1.png"; lt1.save(lt1_p)
    lt2 = lower_third(c.get("league_tag", "ONE FM Football"), c["speaker"], c["role"], c.get("sponsor_logo")); lt2_p = f"{tmp}/lt2.png"; lt2.save(lt2_p)
    has_score = "home" in c and "away" in c
    if has_score: ss = score_strip(c); ss_p = f"{tmp}/score.png"; ss.save(ss_p)
    bx, by = W - 40 - bg_.width, H - 40 - bg_.height; ly = H - 40 - lt1.height; lw = lt1.width
    head = min(15.0, total); tail = 9.0 if (has_score and total > head + 12) else 0.0; body = max(0.0, total - head - tail)
    parts = []
    # A: head — bug in, title lower-third in/out, speaker lower-third in/out
    fcA = (f"[0:v]scale={W}:{H}:flags=lanczos,fps={FPS},setpts=PTS-STARTPTS[v0];"
           f"[1:v]fade=t=in:st=0.3:d=0.4:alpha=1,format=rgba[bug];[v0][bug]overlay={bx}:{by}:shortest=1[a];"
           f"[a][2:v]overlay=x='-{lw}+({lw}+40)*{ease(1.0,0.6)}-({lw}+40)*{ease_in(6.6,0.4)}':y={ly}:shortest=1[b];"
           f"[b][3:v]overlay=x='-{lw}+({lw}+40)*{ease(7.4,0.6)}-({lw}+40)*{ease_in(13.6,0.4)}':y={ly}:shortest=1[c];"
           f"[c]fade=t=in:st=0:d=0.4,format=yuv420p[v];[0:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS[a_]")
    pa = f"{tmp}/a.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(head), "-i", src, "-loop", "1", "-t", str(head), "-i", bg_p,
         "-loop", "1", "-t", str(head), "-i", lt1_p, "-loop", "1", "-t", str(head), "-i", lt2_p,
         "-filter_complex", fcA, "-map", "[v]", "-map", "[a_]", "-t", str(head), *ENC, pa]); parts.append(pa)
    # B: body — static bug only
    if body > 0.5:
        fcB = (f"[0:v]scale={W}:{H}:flags=lanczos,fps={FPS},setpts=PTS-STARTPTS[v0];[v0][1:v]overlay={bx}:{by}:shortest=1,format=yuv420p[v];"
               f"[0:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS[a_]")
        pb = f"{tmp}/b.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(start + head), "-t", str(body), "-i", src, "-loop", "1", "-t", str(body), "-i", bg_p,
             "-filter_complex", fcB, "-map", "[v]", "-map", "[a_]", "-t", str(body), *ENC, pb]); parts.append(pb)
    # C: tail — score strip slides up, fade out
    if tail:
        sy = H - 40 - ss.height
        fcC = (f"[0:v]scale={W}:{H}:flags=lanczos,fps={FPS},setpts=PTS-STARTPTS[v0];[v0][1:v]overlay={bx}:{by}:shortest=1[a];"
               f"[a][2:v]overlay=x=40:y='{sy}+({ss.height}+60)*(1-{ease(0.6,0.7)})':shortest=1[b];"
               f"[b]fade=t=out:st={tail-0.6}:d=0.6,format=yuv420p[v];[0:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS,afade=t=out:st={tail-0.6}:d=0.6[a_]")
        pc = f"{tmp}/c.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(start + head + body), "-t", str(tail), "-i", src, "-loop", "1", "-t", str(tail), "-i", bg_p,
             "-loop", "1", "-t", str(tail), "-i", ss_p, "-filter_complex", fcC, "-map", "[v]", "-map", "[a_]", "-t", str(tail), *ENC, pc]); parts.append(pc)
    if c.get("open"):
        o = c["open"]; op = f"{tmp}/open.png"; card(c, o.get("script", "Grand Final Day"), o["big"], o.get("sub", ""), o.get("sponsor")).save(op)
        po = f"{tmp}/open.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", "2.8", "-i", op, "-f", "lavfi", "-t", "2.8", "-i", "anullsrc=r=48000:cl=stereo",
             "-vf", f"fade=t=in:st=0:d=0.4,fade=t=out:st=2.4:d=0.4,fps={FPS},format=yuv420p", "-shortest", *ENC, po]); parts.insert(0, po)
    if c.get("close"):
        o = c["close"]; cp_ = f"{tmp}/close.png"; card(c, o.get("script", "There was something about the weekend"), o["big"], o.get("sub", "Local footy. Local voices. Live on ONE FM 98.5"), o.get("sponsor"), strip=True).save(cp_)
        pc_ = f"{tmp}/close.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", "3.5", "-i", cp_, "-f", "lavfi", "-t", "3.5", "-i", "anullsrc=r=48000:cl=stereo",
             "-vf", f"fade=t=in:st=0:d=0.4,fade=t=out:st=2.9:d=0.6,fps={FPS},format=yuv420p", "-shortest", *ENC, pc_]); parts.append(pc_)
    lst = f"{tmp}/list.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    final = os.path.join(out_dir, f'{c["name"]}_16x9.mp4')
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final])
    print("wrote", final)

if __name__ == "__main__":
    for p in sys.argv[1:]: build(json.load(open(p)))
