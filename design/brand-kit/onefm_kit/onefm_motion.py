"""ONE FM motion package for interview clips (broadcast-style, ffmpeg + Pillow).

Usage: python3 onefm_motion.py clips/<file>.json [--fmt 9x16|1x1]
Scenes: cold open -> interview (animated lower-third + score bug) -> best players card -> Grand Final tease
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onefm_tile import (A, BG, PANEL, GOLD, WHITE, GREY, LIGHT_CHIP, anton, bar, load, paste, stripes,
                        gold_text, script_over, sponsor_strip)

HERE = os.path.dirname(os.path.abspath(__file__))
SIZES = {"9x16": (1080, 1920), "1x1": (1080, 1080)}
FPS = 30
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2"]

def ease(t0, d):  # ease-out cubic 0..1 as an ffmpeg expression
    return f"(1-pow(1-min(max((t-{t0})/{d},0),1),3))"
def ease_in(t0, d):
    return f"pow(min(max((t-{t0})/{d},0),1),3)"

def run(cmd): subprocess.run(cmd, check=True)
def probe_wh(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip().split(",")
    return int(o[0]), int(o[1])

# ------------------------------------------------------------------ static elements
def rgba(W, H): return Image.new("RGBA", (W, H), (0, 0, 0, 0))

def base_canvas(c, W, H, band_top, band_h, footer=True):
    img = Image.new("RGB", (W, H), BG); stripes(img); d = ImageDraw.Draw(img)
    lg = load("onefm_white.png", (200, 92)); paste(img, lg, ((W - lg.width) // 2, 30)); d = ImageDraw.Draw(img)
    d.text((W / 2, 150), "   ".join(c["league"].upper()), font=bar(600, 22), fill=GOLD, anchor="mm")
    d.rectangle([0, band_top - 3, W, band_top], fill=GOLD); d.rectangle([0, band_top + band_h, W, band_top + band_h + 3], fill=GOLD)
    if footer:
        if H > W:
            sponsor_strip(img, H - 190, H - 122, label_y=H - 208); d = ImageDraw.Draw(img)
            d.text((W / 2, H - 78), "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM.", font=bar(700, 26), fill=GOLD, anchor="mm")
        else:
            d.text((W / 2, H - 40), "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM 98.5", font=bar(700, 24), fill=GOLD, anchor="mm")
    return img

def lower_third(c, W):
    w, h = W - 80, 110; img = rgba(w, h); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=12, fill=PANEL + (235,), outline=GOLD, width=2)
    d.rectangle([0, 0, 12, h], fill=GOLD)
    d.text((36, 22), c["speaker"].upper(), font=anton(44), fill=WHITE)
    d.text((36, 74), c["role"].upper(), font=bar(600, 24), fill=GOLD)
    if c.get("sponsor_logo"):
        d.rounded_rectangle([w - 20 - 170, 22, w - 20, 88], radius=8, fill=LIGHT_CHIP)
        sl = load("sponsors/" + c["sponsor_logo"], (150, 50)); paste(img, sl, (w - 20 - 170 + (170 - sl.width) // 2, 22 + (66 - sl.height) // 2))
    return img

def score_bug(c):
    h, a = c["home"], c["away"]; w, hh = 420, 74; img = rgba(w, hh); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, hh - 1], radius=10, fill=PANEL + (235,), outline=GOLD, width=2)
    hl = load("clubs/" + h["logo"], (56, 56)); al = load("clubs/" + a["logo"], (56, 56))
    paste(img, hl, (12, (hh - hl.height) // 2)); paste(img, al, (w - 12 - al.width, (hh - al.height) // 2)); d = ImageDraw.Draw(img)
    d.text((w / 2 - 22, hh / 2), str(h["score"]), font=anton(40), fill=GOLD if h.get("winner") else WHITE, anchor="rm")
    d.text((w / 2, hh / 2), "–", font=anton(30), fill=GREY, anchor="mm")
    d.text((w / 2 + 22, hh / 2), str(a["score"]), font=anton(40), fill=GOLD if a.get("winner") else WHITE, anchor="lm")
    d.text((w / 2, 10), "FULL TIME", font=bar(700, 14), fill=GREY, anchor="mm")
    return img

def title_card(c, W):
    img = rgba(W, 360); d = ImageDraw.Draw(img); size = 150
    while d.textlength(c["intro_big"].upper(), font=anton(size)) > W - 120: size -= 5
    tmp = Image.new("RGB", (W, 360), (0, 0, 0)); gold_text(tmp, (W / 2, 300), c["intro_big"].upper(), anton(size), anchor="ms")
    m = tmp.convert("L").point(lambda v: 255 if v > 8 else 0)
    img.paste(tmp, (0, 0), m)
    script_over(img, (W / 2 - 10, 170), c.get("intro_script", "Full Time"), 100)
    return img

def score_panel(c, W):
    h, a = c["home"], c["away"]; w, hh = W - 120, 120; img = rgba(w, hh); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, hh - 1], radius=14, fill=PANEL + (240,), outline=GOLD, width=2)
    hl = load("clubs/" + h["logo"], (92, 90)); al = load("clubs/" + a["logo"], (92, 90))
    paste(img, hl, (20, (hh - hl.height) // 2)); paste(img, al, (w - 20 - al.width, (hh - al.height) // 2)); d = ImageDraw.Draw(img)
    cy = hh / 2
    for team, xn, xs, anc in ((h, 130, 420, "l"), (a, w - 130, w - 420, "r")):
        d.text((xn, cy - 24), team["name"].upper(), font=bar(800, 30), fill=WHITE, anchor=anc + "m")
        d.text((xn, cy + 14), team.get("detail", ""), font=bar(600, 22), fill=GREY, anchor=anc + "m")
        d.text((xs, cy), str(team["score"]), font=anton(64), fill=GOLD if team.get("winner") else WHITE, anchor=("r" if anc == "l" else "l") + "m")
    d.text((w / 2, cy), "DEF" if h.get("winner") else "V", font=bar(700, 22), fill=GOLD, anchor="mm")
    return img

def name_plate(name, sub, w=480):
    img = rgba(w, 96); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, 95], radius=10, fill=PANEL + (235,), outline=GOLD, width=2); d.rectangle([0, 0, 10, 96], fill=GOLD)
    d.text((28, 16), name.upper(), font=anton(38), fill=WHITE); d.text((28, 62), sub.upper(), font=bar(600, 20), fill=GOLD)
    return img

def best_list(c, w):
    h, a = c["home"], c["away"]; hh = 250; img = rgba(w, hh); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, hh - 1], radius=14, fill=PANEL + (235,), outline=GOLD, width=2)
    d.text((20, 16), "B E S T   P L A Y E R S", font=bar(600, 22), fill=GOLD); d.line([(20, 48), (w - 20, 48)], fill=(70, 60, 30))
    colw = w // 2
    for i, team in enumerate((h, a)):
        cx = 20 + i * colw
        tl = load("clubs/" + team["logo"], (30, 30)); paste(img, tl, (cx, 60)); d = ImageDraw.Draw(img)
        d.text((cx + 40, 75), team["name"].upper(), font=bar(700, 22), fill=WHITE, anchor="lm")
        for j, n in enumerate(team.get("best", [])[:5]):
            d.text((cx, 102 + j * 28), n, font=bar(400, 24), fill=WHITE if j else GOLD)
    return img

def tease_bits(c, W):
    t = c["tease"]; title = rgba(W, 360); d = ImageDraw.Draw(title); size = 190
    while d.textlength(t["big"].upper(), font=anton(size)) > W - 100: size -= 5
    tmp = Image.new("RGB", (W, 360), (0, 0, 0)); gold_text(tmp, (W / 2, 330), t["big"].upper(), anton(size), anchor="ms")
    title.paste(tmp, (0, 0), tmp.convert("L").point(lambda v: 255 if v > 8 else 0))
    script_over(title, (W / 2 - 10, 150), t["script"], 110)
    detail = rgba(W, 220); d = ImageDraw.Draw(detail)
    d.rounded_rectangle([60, 0, W - 60, 130], radius=16, fill=PANEL + (240,), outline=GOLD, width=2)
    d.text((W / 2, 65), t["line1"].upper(), font=bar(800, 44), fill=WHITE, anchor="mm")
    d.text((W / 2, 160), t["line2"].upper(), font=bar(600, 28), fill=GREY, anchor="mm")
    d.text((W / 2, 200), "LIVE ON ONE FM 98.5", font=anton(40), fill=GOLD, anchor="mm")
    hl = load("clubs/" + t["home_logo"], (110, 110)); al = load("clubs/" + t["away_logo"], (110, 110))
    return title, detail, hl, al

def photo_band(path, band, focus):
    im = Image.open(os.path.join(A, path)).convert("RGB")
    return ImageOps.fit(im, (int(band[0] * 1.15), int(band[1] * 1.15)), Image.LANCZOS, centering=focus)

# ------------------------------------------------------------------ scenes
def scene_open(c, W, H, top, bh, tmp, out):
    dur = 3.6
    bg = base_canvas(c, W, H, top, bh); bg_p = f"{tmp}/bg_open.png"; bg.save(bg_p)
    ph = photo_band(c["open_photo"], (W, bh), tuple(c.get("open_focus", [0.5, 0.4]))); ph_p = f"{tmp}/open_photo.png"; ph.save(ph_p)
    tc = title_card(c, W); tc_p = f"{tmp}/title.png"; tc.save(tc_p)
    sp = score_panel(c, W); sp_p = f"{tmp}/score_panel.png"; sp.save(sp_p)
    ty = (top - 360) // 2 + 10 if H > W else top + 20
    sy = top + bh + 30 if H > W else top + bh - 150
    fc = (f"[1:v]zoompan=z='1+0.12*in/{int(dur*FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{bh}:fps={FPS},"
          f"format=rgba,colorchannelmixer=aa=0.85,fade=t=in:st=0:d=0.5:alpha=1[ph];"
          f"[0:v][ph]overlay=0:{top}[a];"
          f"[2:v]fade=t=in:st=0.5:d=0.5:alpha=1,format=rgba[tc];[a][tc]overlay=x=0:y='{ty}+40*(1-{ease(0.5,0.7)})'[b];"
          f"[3:v]fade=t=in:st=1.1:d=0.4:alpha=1,format=rgba[sp];[b][sp]overlay=x=60:y='{sy}+80*(1-{ease(1.1,0.6)})'[c];"
          f"[c]fade=t=out:st={dur-0.35}:d=0.35,format=yuv420p[v];"
          f"anullsrc=r=48000:cl=stereo,atrim=duration={dur}[a_]")
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(dur), "-i", bg_p, "-loop", "1", "-t", str(dur), "-i", ph_p, "-loop", "1", "-t", str(dur), "-i", tc_p, "-loop", "1", "-t", str(dur), "-i", sp_p,
         "-filter_complex", fc, "-map", "[v]", "-map", "[a_]", "-t", str(dur), *ENC, out])

def probe_dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip())

def scene_interview(c, W, H, top, bh, tmp, out):
    """Part A (first 10 s): animated lower-third + score bug.  Part B (rest): static overlays, fast encode."""
    src = c["src"] if os.path.isabs(c["src"]) else os.path.join(HERE, c["src"])
    start = float(c.get("start", 0)); end = float(c.get("end") or probe_dur(src)); total = end - start
    split = min(10.0, total)
    bg = base_canvas(c, W, H, top, bh); bg_p = f"{tmp}/bg_int.png"; bg.save(bg_p)
    lt = lower_third(c, W); lt_p = f"{tmp}/lt.png"; lt.save(lt_p)
    sb = score_bug(c); sb_p = f"{tmp}/bug.png"; sb.save(sb_p)
    ly = top + bh + 28; by = top - 98 if H > W else 170; lt_w = lt.width
    stat = bg.copy(); paste(stat, sb, ((W - sb.width) // 2, by)); paste(stat, lt, (40, ly)); stat_p = f"{tmp}/bg_int_static.png"; stat.save(stat_p)
    pa, pb = f"{tmp}/s2a.mp4", f"{tmp}/s2b.mp4"
    fcA = (f"[2:v]scale={W}:{bh},fps={FPS},setpts=PTS-STARTPTS[clip];[0:v][clip]overlay=0:{top}:shortest=1[a];"
           f"[a][1:v]overlay=x='-{lt_w}+({lt_w}+40)*{ease(1.0,0.6)}':y={ly}:shortest=1[b];"
           f"[b][3:v]overlay=x='(W-w)/2':y='{by}-90*(1-{ease(0.4,0.6)})':shortest=1[c];"
           f"[c]fade=t=in:st=0:d=0.3,format=yuv420p[v];[2:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS[a_]")
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(split), "-i", bg_p, "-loop", "1", "-t", str(split), "-i", lt_p,
         "-ss", str(start), "-t", str(split), "-i", src, "-loop", "1", "-t", str(split), "-i", sb_p,
         "-filter_complex", fcA, "-map", "[v]", "-map", "[a_]", "-t", str(split), *ENC, pa])
    parts = [pa]
    if total > split + 0.5:
        rest = total - split
        fcB = (f"[1:v]scale={W}:{bh},fps={FPS},setpts=PTS-STARTPTS[clip];[0:v][clip]overlay=0:{top}:shortest=1,format=yuv420p[v];"
               f"[1:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS[a_]")
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(rest), "-i", stat_p, "-ss", str(start + split), "-t", str(rest), "-i", src,
             "-filter_complex", fcB, "-map", "[v]", "-map", "[a_]", "-t", str(rest), *ENC, pb])
        parts.append(pb)
    lst = f"{tmp}/int_list.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out])

def scene_players(c, W, H, top, bh, tmp, out):
    dur = 5.5; feats = c.get("featured", [])[:2]
    bg = base_canvas(c, W, H, top, bh); bg_p = f"{tmp}/bg_pl.png"; bg.save(bg_p)
    pw = (W - 12) // 2; inputs = ["-loop", "1", "-i", bg_p]; fc = ""; prev = "0:v"
    for i, f in enumerate(feats):
        ph = photo_band(f["photo"], (pw, bh), tuple(f.get("focus", [0.5, 0.35]))); ph_p = f"{tmp}/feat{i}.png"; ph.save(ph_p)
        np_ = name_plate(f["name"], f.get("sub", "Best on ground")); np_p = f"{tmp}/plate{i}.png"; np_.save(np_p)
        inputs += ["-loop", "1", "-i", ph_p, "-loop", "1", "-i", np_p]
        pi, ni = 1 + i * 2, 2 + i * 2; x0 = i * (pw + 12)
        fc += (f"[{pi}:v]zoompan=z='1+0.1*in/{int(dur*FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={pw}x{bh}:fps={FPS},"
               f"fade=t=in:st={0.2+0.3*i}:d=0.4:alpha=1,format=rgba[p{i}];[{prev}][p{i}]overlay={x0}:{top}[s{i}];"
               f"[s{i}][{ni}:v]overlay=x={x0+12}:y='{top+bh-116}+60*(1-{ease(0.9+0.3*i,0.5)})':format=auto:enable='gte(t,{0.9+0.3*i})'[t{i}];")
        prev = f"t{i}"
    bl = best_list(c, W - 80); bl_p = f"{tmp}/bestlist.png"; bl.save(bl_p); inputs += ["-loop", "1", "-i", bl_p]
    bi = 1 + len(feats) * 2; by = top + bh + 28 if H > W else top + 20
    fc += (f"[{bi}:v]fade=t=in:st=1.8:d=0.5:alpha=1,format=rgba[bl];[{prev}][bl]overlay=40:'{by}+30*(1-{ease(1.8,0.6)})'[u];"
           f"[u]fade=t=out:st={dur-0.35}:d=0.35,format=yuv420p[v];anullsrc=r=48000:cl=stereo,atrim=duration={dur}[a_]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a_]", "-t", str(dur), *ENC, out])

def scene_tease(c, W, H, tmp, out):
    dur = 5.5; mid = H // 2
    bg = Image.new("RGB", (W, H), BG); stripes(bg)
    lg = load("onefm_white.png", (300, 140)); paste(bg, lg, ((W - lg.width) // 2, mid - 400 if H > W else 30))
    if H > W: sponsor_strip(bg, H - 190, H - 122, label_y=H - 208)
    bg_p = f"{tmp}/bg_tease.png"; bg.save(bg_p)
    title, detail, hl, al = tease_bits(c, W)
    for n, im in (("tease_title", title), ("tease_detail", detail), ("tease_hl", hl), ("tease_al", al)): im.save(f"{tmp}/{n}.png")
    ty = mid - 250 if H > W else 150; dy = ty + 380
    fc = (f"[1:v]fade=t=in:st=0.3:d=0.5:alpha=1,format=rgba[t];[0:v][t]overlay=0:'{ty}+50*(1-{ease(0.3,0.8)})'[a];"
          f"[2:v]fade=t=in:st=1.2:d=0.5:alpha=1,format=rgba[dt];[a][dt]overlay=0:'{dy}+40*(1-{ease(1.2,0.7)})'[b];"
          f"[b][3:v]overlay=x='-120+(120+84)*{ease(1.1,0.7)}':y={dy+10}:format=auto[c];"
          f"[c][4:v]overlay=x='W+120-(120+84+w)*{ease(1.1,0.7)}':y={dy+10}:format=auto[d];"
          f"[d]fade=t=in:st=0:d=0.3,fade=t=out:st={dur-0.5}:d=0.5,format=yuv420p[v];anullsrc=r=48000:cl=stereo,atrim=duration={dur}[a_]")
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", bg_p, "-loop", "1", "-i", f"{tmp}/tease_title.png", "-loop", "1", "-i", f"{tmp}/tease_detail.png",
         "-loop", "1", "-i", f"{tmp}/tease_hl.png", "-loop", "1", "-i", f"{tmp}/tease_al.png",
         "-filter_complex", fc, "-map", "[v]", "-map", "[a_]", "-t", str(dur), *ENC, out])

def build(c, fmt):
    W, H = SIZES[fmt]; tmp = os.path.join(HERE, "tmp", fmt); os.makedirs(tmp, exist_ok=True)
    out_dir = os.path.join(HERE, "out"); os.makedirs(out_dir, exist_ok=True)
    src = c["src"] if os.path.isabs(c["src"]) else os.path.join(HERE, c["src"])
    sw, sh = probe_wh(src); bh = int(round(W * sh / sw / 2) * 2)
    top = (H - bh) // 2 - (60 if H > W else 0)
    scenes = [f"{tmp}/s1.mp4", f"{tmp}/s2.mp4", f"{tmp}/s3.mp4", f"{tmp}/s4.mp4"]
    scene_open(c, W, H, top, bh, tmp, scenes[0])
    scene_interview(c, W, H, top, bh, tmp, scenes[1])
    scene_players(c, W, H, top, bh, tmp, scenes[2])
    scene_tease(c, W, H, tmp, scenes[3])
    lst = f"{tmp}/list.txt"; open(lst, "w").write("".join(f"file '{s}'\n" for s in scenes))
    final = os.path.join(out_dir, f'{c["name"]}_{fmt}.mp4')
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final])
    print("wrote", final)

if __name__ == "__main__":
    args = sys.argv[1:]; fmt = "9x16"
    if "--fmt" in args: i = args.index("--fmt"); fmt = args[i + 1]; del args[i:i + 2]
    scene = None
    if "--scene" in args: i = args.index("--scene"); scene = args[i + 1]; del args[i:i + 2]
    for p in args:
        c = json.load(open(p))
        if scene:  # render a single scene for checking
            W, H = SIZES[fmt]; tmp = os.path.join(HERE, "tmp", fmt); os.makedirs(tmp, exist_ok=True)
            sw, sh = probe_wh(c["src"] if os.path.isabs(c["src"]) else os.path.join(HERE, c["src"])); bh = int(round(W * sh / sw / 2) * 2); top = (H - bh) // 2 - (60 if H > W else 0)
            {"open": lambda: scene_open(c, W, H, top, bh, tmp, f"{tmp}/s1.mp4"), "interview": lambda: scene_interview(c, W, H, top, bh, tmp, f"{tmp}/s2.mp4"),
             "players": lambda: scene_players(c, W, H, top, bh, tmp, f"{tmp}/s3.mp4"), "tease": lambda: scene_tease(c, W, H, tmp, f"{tmp}/s4.mp4")}[scene]()
        else:
            build(c, fmt)
