"""ONE FM roll-through — photo slideshow video (Oporto Player of the Day etc).

Usage: python3 onefm_rollthrough.py clips/<file>.json [--fmt 9x16|1x1|16x9]
JSON: {name, league, title_script, title_big, slides:[{photo, focus:[x,y], line1, line2, line3}], secs (per slide),
       sponsor_logo (optional), outro_line}
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onefm_tile import A, BG, PANEL, GOLD, WHITE, GREY, LIGHT_CHIP, anton, bar, vibes, load, paste, stripes, gold_text, script_over, sponsor_strip

HERE = os.path.dirname(os.path.abspath(__file__))
SIZES = {"9x16": (1080, 1920), "1x1": (1080, 1080), "16x9": (1920, 1080)}
FPS = 30
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS)]

def ease(t0, d): return f"(1-pow(1-min(max((t-{t0})/{d},0),1),3))"
def run(cmd): subprocess.run(cmd, check=True)
def rgba(w, h): return Image.new("RGBA", (w, h), (0, 0, 0, 0))

def photo_full(path, W, H, focus):
    im = ImageOps.exif_transpose(Image.open(os.path.join(A, path))).convert("RGB")
    cw, chh = int(W * 1.12), int(H * 1.12)
    if (im.width / im.height) > (W / H) * 1.25:
        # landscape photo on a portrait canvas: blurred fill behind, photo full-width
        from PIL import ImageFilter
        bg = ImageOps.fit(im, (cw, chh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
        bg = Image.eval(bg, lambda v: int(v * 0.45))
        r = float(focus[2]) if len(focus) > 2 else 0.8   # crop ratio (w/h) for the foreground cut from a wide photo
        fw = min(im.width, int(im.height * r)); x0 = int(max(0, min(im.width - fw, focus[0] * im.width - fw / 2)))
        fg = im.crop((x0, 0, x0 + fw, im.height)); fg.thumbnail((cw, chh), Image.LANCZOS)
        y = int((chh - fg.height) * 0.42)
        bg.paste(fg, ((cw - fg.width) // 2, y)); im = bg
    else:
        im = ImageOps.fit(im, (cw, chh), Image.LANCZOS, centering=tuple(focus[:2]))
    ov = Image.new("L", im.size, 0); od = ImageDraw.Draw(ov)
    for y in range(im.height):
        t = y / im.height; a = int(220 * min(1, max(0, (t - 0.58) / 0.42)) ** 1.4)
        od.line([(0, y), (im.width, y)], fill=a)
    im.paste(Image.new("RGB", im.size, BG), (0, 0), ov)
    return im

def plate(c, s, W):
    w = W - 100; h = 250; img = rgba(w, h); d = ImageDraw.Draw(img)
    script_over(img, (d.textlength(c["title_script"], font=vibes(72)) / 2 + 4, 40), c["title_script"], 72)
    size = 78
    while d.textlength(s["line1"].upper(), font=anton(size)) > w - 20: size -= 4
    tmp = Image.new("RGB", (w, h), (0, 0, 0)); gold_text(tmp, (4, 150), s["line1"].upper(), anton(size), anchor="ls")
    img.paste(tmp, (0, 0), tmp.convert("L").point(lambda v: 255 if v > 8 else 0)); d = ImageDraw.Draw(img)
    d.text((6, 170), s.get("line2", "").upper(), font=bar(700, 32), fill=WHITE)
    d.text((6, 212), s.get("line3", "").upper(), font=bar(400, 24), fill=GREY)
    return img

def chrome(c, W, H):
    """Static top chrome: ONE FM logo + league line + optional sponsor chip."""
    img = rgba(W, H); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 7], fill=GOLD); d.rectangle([0, H - 7, W, H], fill=GOLD)
    lg = load("onefm_white.png", (170, 80)); paste(img, lg, (44, 28)); d = ImageDraw.Draw(img)
    d.text((W - 44, 66), "   ".join(c["league"].upper()), font=bar(600, 20), fill=GOLD, anchor="rm")
    if c.get("sponsor_logo"):
        cw, ch = 220, 64; x0, y0 = W - 44 - cw, H - 44 - ch
        d.rounded_rectangle([x0, y0, x0 + cw, y0 + ch], radius=10, fill=LIGHT_CHIP)
        sl = load("sponsors/" + c["sponsor_logo"], (cw - 24, ch - 16)); paste(img, sl, (x0 + (cw - sl.width) // 2, y0 + (ch - sl.height) // 2))
    return img

def card(c, W, H, big, script, sub, outro=False):
    img = Image.new("RGB", (W, H), BG); stripes(img); d = ImageDraw.Draw(img); mid = H // 2
    lg = load("onefm_white.png", (280, 130)); paste(img, lg, ((W - lg.width) // 2, mid - 330)); d = ImageDraw.Draw(img)
    d.text((W / 2, mid - 170), "   ".join(c["league"].upper()), font=bar(600, 24), fill=GOLD, anchor="mm")
    size = 160
    while d.textlength(big.upper(), font=anton(size)) > W - 100: size -= 5
    gold_text(img, (W / 2, mid + 40), big.upper(), anton(size), anchor="ms"); script_over(img, (W / 2 - 10, mid - 110), script, 100)
    d = ImageDraw.Draw(img); d.text((W / 2, mid + 90), sub.upper(), font=bar(700, 30), fill=WHITE, anchor="mm")
    if c.get("sponsor_logo"):
        cw, ch = 360, 96; x0, y0 = (W - cw) // 2, mid + 140
        d.rounded_rectangle([x0, y0, x0 + cw, y0 + ch], radius=12, fill=LIGHT_CHIP)
        sl = load("sponsors/" + c["sponsor_logo"], (cw - 40, ch - 24)); paste(img, sl, (x0 + (cw - sl.width) // 2, y0 + (ch - sl.height) // 2))
    if outro and H >= W: sponsor_strip(img, H - 190, H - 122, label_y=H - 208)
    return img

def build(c, fmt):
    W, H = SIZES[fmt]; tmp = os.path.join(HERE, "tmp", "roll_" + fmt); os.makedirs(tmp, exist_ok=True)
    out_dir = os.path.join(HERE, "out"); os.makedirs(out_dir, exist_ok=True)
    secs = float(c.get("secs", 4.0)); xf = 0.6
    ch = chrome(c, W, H); ch_p = f"{tmp}/chrome.png"; ch.save(ch_p)
    segs = []
    # intro
    ip = f"{tmp}/intro.png"; card(c, W, H, c["title_big"], c["title_script"], c.get("intro_sub", "")).save(ip)
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", "2.6", "-i", ip, "-vf", f"fade=t=in:st=0:d=0.4,fps={FPS},format=yuv420p", "-t", "2.6", *ENC, f"{tmp}/s_intro.mp4"]); segs.append(f"{tmp}/s_intro.mp4")
    for i, s in enumerate(c["slides"]):
        ph = photo_full(s["photo"], W, H, s.get("focus", [0.5, 0.3])); ph_p = f"{tmp}/p{i}.png"; ph.save(ph_p)
        pl = plate(c, s, W); pl_p = f"{tmp}/pl{i}.png"; pl.save(pl_p)
        py = H - 44 - pl.height - (80 if c.get("sponsor_logo") and W <= H else 0)
        n = int(secs * FPS); zdir = "1+0.12*in/%d" % n if i % 2 == 0 else "1.12-0.12*in/%d" % n
        fc = (f"[0:v]zoompan=z='{zdir}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS}[bg];"
              f"[bg][1:v]overlay=0:0[a];[a][2:v]overlay=x='-{pl.width}+({pl.width}+50)*{ease(0.5,0.7)}':y={py},format=yuv420p[v]")
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(secs), "-i", ph_p, "-loop", "1", "-t", str(secs), "-i", ch_p, "-loop", "1", "-t", str(secs), "-i", pl_p,
             "-filter_complex", fc, "-map", "[v]", "-t", str(secs), *ENC, f"{tmp}/s{i}.mp4"]); segs.append(f"{tmp}/s{i}.mp4")
    op = f"{tmp}/outro.png"; card(c, W, H, c.get("outro_big", c["title_big"]), c["title_script"], c.get("outro_line", ""), outro=True).save(op)
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", "3.5", "-i", op, "-vf", f"fade=t=out:st=2.9:d=0.6,fps={FPS},format=yuv420p", "-t", "3.5", *ENC, f"{tmp}/s_outro.mp4"]); segs.append(f"{tmp}/s_outro.mp4")
    # crossfade chain
    inputs = []; [inputs.extend(["-i", s]) for s in segs]
    durs = [2.6] + [secs] * len(c["slides"]) + [3.5]
    fc = ""; prev = "0:v"; off = 0.0
    for i in range(1, len(segs)):
        off += durs[i - 1] - xf; lab = f"x{i}"
        fc += f"[{prev}][{i}:v]xfade=transition=fade:duration={xf}:offset={off:.3f}[{lab}];"; prev = lab
    fc = fc.rstrip(";")
    final = os.path.join(out_dir, f'{c["name"]}_{fmt}.mp4')
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", f"[{prev}]", "-an", *ENC, "-movflags", "+faststart", final])
    print("wrote", final)

if __name__ == "__main__":
    args = sys.argv[1:]; fmt = "9x16"
    if "--fmt" in args: i = args.index("--fmt"); fmt = args[i + 1]; del args[i:i + 2]
    for p in args: build(json.load(open(p)), fmt)
