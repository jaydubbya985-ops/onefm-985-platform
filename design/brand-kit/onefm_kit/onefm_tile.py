"""ONE FM 98.5 social tile renderer.

Usage:  python3 onefm_tile.py matches/<file>.json [more.json ...]
Output: out/<name>.png

Templates (set "template" in the JSON):
  preview      1080x1080  match preview with guests + sponsor strip
  final_score  1080x1350  result tile, big caps behind optional team photo

All logos are placed as image files, never redrawn.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "assets")
FONTS = os.path.join(A, "fonts")

BG = (11, 11, 18); PANEL = (18, 18, 30)
GOLD = (232, 200, 74); GOLD_LT = (247, 228, 160); GOLD_DK = (186, 150, 50)
WHITE = (255, 255, 255); GREY = (190, 190, 200); RED = (204, 20, 40)
LIGHT_CHIP = (245, 243, 238)

# sponsor logo -> chip background ("light" for dark/black artwork, "dark" for white artwork)
SPONSORS = [("oporto_black.png", "light"), ("gagliardi_scott.png", "dark"), ("crowbar.png", "light"),
            ("foott.png", "dark"), ("darryl_twitt.png", "light"), ("peppermill.png", "dark")]

def F(name, size): return ImageFont.truetype(os.path.join(FONTS, name + ".ttf"), size)
def anton(s): return F("anton-latin-400-normal", s)
def vibes(s): return F("great-vibes-latin-400-normal", s)
def bar(w, s): return F(f"barlow-condensed-latin-{w}-normal", s)

def load(path, box=None):
    p = path if os.path.isabs(path) else os.path.join(A, path)
    im = Image.open(p).convert("RGBA")
    im = im.crop(im.getbbox())
    if box: im.thumbnail(box, Image.LANCZOS)
    return im

def paste(img, im, xy): img.paste(im, xy, im)

def stripes(img):
    W, H = img.size
    s = Image.new("RGBA", img.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(s)
    for x in range(-H, W + H, 140):
        sd.polygon([(x, 0), (x + 60, 0), (x + 60 + H, H), (x + H, H)], fill=(255, 255, 255, 7))
    img.paste(s, (0, 0), s)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 7], fill=GOLD); d.rectangle([0, H - 7, W, H], fill=GOLD)

def gold_text(base, xy, text, fnt, anchor="la"):
    mask = Image.new("L", base.size, 0)
    ImageDraw.Draw(mask).text(xy, text, font=fnt, fill=255, anchor=anchor)
    b = mask.getbbox()
    if not b: return
    grad = Image.new("RGB", base.size, GOLD); gd = ImageDraw.Draw(grad)
    for y in range(b[1], b[3] + 1):
        t = (y - b[1]) / max(1, b[3] - b[1])
        if t < 0.55:
            k = t / 0.55; c = tuple(int(GOLD_LT[i] * (1 - k) + GOLD[i] * k) for i in range(3))
        else:
            k = (t - 0.55) / 0.45; c = tuple(int(GOLD[i] * (1 - k) + GOLD_DK[i] * k) for i in range(3))
        gd.line([(0, y), (base.size[0], y)], fill=c)
    sh = mask.filter(ImageFilter.GaussianBlur(10))
    base.paste(Image.new("RGB", base.size, (0, 0, 0)), (0, 8), sh)
    base.paste(grad, (0, 0), mask)

def script_over(img, xy, text, size):
    g = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).text(xy, text, font=vibes(size), fill=(255, 255, 255, 140), anchor="mm")
    g = g.filter(ImageFilter.GaussianBlur(12)); img.paste(g, (0, 0), g)
    ImageDraw.Draw(img).text(xy, text, font=vibes(size), fill=WHITE, anchor="mm")

def sponsor_strip(img, y0, y1, label_y=None):
    W = img.width; d = ImageDraw.Draw(img)
    if label_y:
        d.text((W / 2, label_y), "P R O U D L Y   S U P P O R T E D   B Y", font=bar(600, 20), fill=GOLD, anchor="mm")
    gap, n = 12, len(SPONSORS); cw = (W - 120 - gap * (n - 1)) // n
    for i, (f, bg) in enumerate(SPONSORS):
        x0 = 60 + i * (cw + gap)
        d.rounded_rectangle([x0, y0, x0 + cw, y1], radius=10, fill=LIGHT_CHIP if bg == "light" else PANEL,
                            outline=(70, 60, 30), width=1)
        lg = load("sponsors/" + f, (cw - 20, y1 - y0 - 14))
        paste(img, lg, (x0 + (cw - lg.width) // 2, y0 + (y1 - y0 - lg.height) // 2))
        d = ImageDraw.Draw(img)

def guest_panel(img, g, x, y0, y1, pw):
    """g = {photo, face:[cx,cy,face_h] in source px, label, name, line1, line2}"""
    im = ImageOps.exif_transpose(Image.open(os.path.join(A, g["photo"]))).convert("RGB")
    cx, cy, fh = g["face"]
    ph = y1 - y0; scale = (0.65 * ph) / fh
    cw, ch = pw / scale, ph / scale
    pad = max(0, int(0.75 * cw - cx))          # pad black on the left if face can't sit at 75%
    if pad:
        c = Image.new("RGB", (im.width + pad, im.height), (0, 0, 0)); c.paste(im, (pad, 0)); im = c; cx += pad
    x0 = int(cx - 0.75 * cw); yy0 = int(cy - 0.45 * ch)
    x0 = max(0, min(x0, im.width - int(cw))); yy0 = max(0, min(yy0, im.height - int(ch)))
    im = im.crop((x0, yy0, x0 + int(cw), yy0 + int(ch)))
    im = ImageOps.fit(im, (pw, ph), Image.LANCZOS)
    w, h = im.size
    yy, xx = np.mgrid[0:h, 0:w]
    bx = np.clip((xx / w - 0.30) / 0.40, 0, 1); by = np.clip((yy / h - 0.40) / 0.45, 0, 1)
    dark = np.clip((1 - bx) * by * 1.25 + by * 0.35, 0, 1)
    fade = Image.fromarray((255 * (1 - dark) ** 1.4).astype("uint8"), "L")
    base = Image.new("RGB", im.size, (12, 12, 22)); base.paste(im, (0, 0), fade)
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], radius=14, fill=255)
    img.paste(base, (x, y0), m)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x, y0, x + pw, y1], radius=14, outline=GOLD, width=2)
    tx = x + 22
    d.text((tx, y1 - 118), g["label"].upper(), font=bar(600, 24), fill=GOLD)
    d.text((tx, y1 - 92), g["name"].upper(), font=anton(40), fill=WHITE)
    d.text((tx, y1 - 46), g.get("line1", ""), font=bar(600, 22), fill=WHITE)
    d.text((tx, y1 - 24), g.get("line2", ""), font=bar(400, 20), fill=GREY)

# ------------------------------------------------------------------ templates
def preview(m):
    W = H = 1080
    img = Image.new("RGB", (W, H), BG); stripes(img); d = ImageDraw.Draw(img)
    lg = load("onefm_white.png", (240, 108)); paste(img, lg, ((W - lg.width) // 2, 24))
    if m.get("badge"):
        f = bar(700, 30); pw = d.textlength(m["badge"], font=f) + 56
        d.rounded_rectangle([W - 60 - pw, 42, W - 60, 90], radius=24, fill=RED)
        d.text((W - 60 - pw / 2, 66), m["badge"].upper(), font=f, fill=WHITE, anchor="mm")
    gold_text(img, (W / 2, 378), m["title_big"].upper(), anton(245), anchor="ms")
    script_over(img, (W / 2 - 10, 206), m["title_script"], 120)
    d = ImageDraw.Draw(img)
    sy0, sy1 = 400, 512
    d.rounded_rectangle([60, sy0, W - 60, sy1], radius=16, fill=PANEL, outline=GOLD, width=2)
    hl = load("clubs/" + m["home"]["logo"], (110, 96)); al = load("clubs/" + m["away"]["logo"], (96, 96))
    paste(img, hl, (80, sy0 + (sy1 - sy0 - hl.height) // 2)); paste(img, al, (W - 80 - al.width, sy0 + (sy1 - sy0 - al.height) // 2))
    d = ImageDraw.Draw(img); tf = bar(800, 58); cy = (sy0 + sy1) // 2 + 2
    d.text((W / 2 - 60, cy), m["home"]["name"].upper(), font=tf, fill=WHITE, anchor="rm")
    d.text((W / 2, cy), "V", font=bar(700, 40), fill=GOLD, anchor="mm")
    d.text((W / 2 + 60, cy), m["away"]["name"].upper(), font=tf, fill=WHITE, anchor="lm")
    d.text((W / 2, 548), "   •   ".join([m["date"], m["venue"], "BOUNCE " + m["bounce"]]).upper(), font=bar(600, 32), fill=GREY, anchor="mm")
    by0, by1 = 578, 646
    d.rounded_rectangle([60, by0, W - 60, by1], radius=12, fill=PANEL, outline=GOLD, width=2)
    lg = load("onefm_white.png", (230, 60)); paste(img, lg, (84, by0 + (by1 - by0 - lg.height) // 2 + 2))
    d = ImageDraw.Draw(img)
    d.text((84 + lg.width + 24, (by0 + by1) // 2), "ON AIR FROM", font=bar(600, 30), fill=GREY, anchor="lm")
    d.text((W - 84, (by0 + by1) // 2), m["on_air"], font=anton(48), fill=GOLD, anchor="rm")
    py0, py1 = 672, 905; pw = W // 2 - 72
    for i, g in enumerate(m.get("guests", [])[:2]):
        guest_panel(img, g, [60, W // 2 + 12][i], py0, py1, pw)
    sponsor_strip(img, 942, 1010, label_y=925)
    ImageDraw.Draw(img).text((W / 2, 1044), m.get("footer", "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM.").upper(), font=bar(700, 28), fill=GOLD, anchor="mm")
    return img

def final_score(m):
    W, H = 1080, 1350
    img = Image.new("RGB", (W, H), BG); stripes(img); d = ImageDraw.Draw(img)
    lg = load("onefm_white.png", (220, 100)); paste(img, lg, ((W - lg.width) // 2, 28))
    d = ImageDraw.Draw(img)
    d.text((W / 2, 160), "   ".join(m["league"].upper()), font=bar(600, 26), fill=GOLD, anchor="mm")
    title = m.get("title_big", "FINAL SCORE").upper(); size = 250
    while d.textlength(title, font=anton(size)) > W - 120: size -= 5
    has_photo = bool(m.get("photo"))
    gold_text(img, (W / 2, 470), title, anton(size), anchor="ms")
    if has_photo:  # cut-out team photo sits over the caps, feet on the score box
        ph = load(m["photo"], (W - 160, 620)); paste(img, ph, ((W - ph.width) // 2, 740 - ph.height))
    d = ImageDraw.Draw(img)
    sy0, sy1 = (720, 900) if has_photo else (560, 740)
    shift = 0 if has_photo else -160
    d.rounded_rectangle([60, sy0, W - 60, sy1], radius=16, fill=PANEL, outline=GOLD, width=2)
    hl = load("clubs/" + m["home"]["logo"], (150, 140)); al = load("clubs/" + m["away"]["logo"], (150, 140))
    paste(img, hl, (90, sy0 + (sy1 - sy0 - hl.height) // 2)); paste(img, al, (W - 90 - al.width, sy0 + (sy1 - sy0 - al.height) // 2))
    d = ImageDraw.Draw(img); cy = (sy0 + sy1) // 2 + 6
    d.text((W / 2 - 60, cy), str(m["home"]["score"]), font=anton(120), fill=WHITE, anchor="rm")
    d.text((W / 2, cy), "–", font=anton(90), fill=GOLD, anchor="mm")
    d.text((W / 2 + 60, cy), str(m["away"]["score"]), font=anton(120), fill=WHITE, anchor="lm")
    if m["home"].get("detail"): d.text((W / 2 - 60, cy + 72), m["home"]["detail"], font=bar(600, 24), fill=GREY, anchor="rm")
    if m["away"].get("detail"): d.text((W / 2 + 60, cy + 72), m["away"]["detail"], font=bar(600, 24), fill=GREY, anchor="lm")
    d.text((W / 2 - 60, sy0 + 20), m["home"]["name"].upper(), font=bar(700, 24), fill=GOLD, anchor="rm")
    d.text((W / 2 + 60, sy0 + 20), m["away"]["name"].upper(), font=bar(700, 24), fill=GOLD, anchor="lm")
    d.text((W / 2, 945 + shift), "   ".join(m.get("grade", "").upper()), font=bar(600, 30), fill=WHITE, anchor="mm")
    d.text((W / 2, 990 + shift), "   •   ".join(x for x in [m.get("round", ""), m.get("venue", ""), m.get("date", "")] if x).upper(), font=bar(400, 28), fill=GREY, anchor="mm")
    if m.get("best"):
        d.text((W / 2, 1040 + shift), "BEST   " + "  •  ".join(m["best"]), font=bar(600, 24), fill=GREY, anchor="mm")
    sponsor_strip(img, 1130 + shift // 2, 1198 + shift // 2, label_y=1112 + shift // 2)
    d = ImageDraw.Draw(img)
    d.text((W / 2, 1236 + shift // 2), m.get("footer", "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM.").upper(), font=bar(700, 28), fill=GOLD, anchor="mm")
    return img


def photo_fill(path, box, focus=(0.5, 0.4)):
    im = ImageOps.exif_transpose(Image.open(os.path.join(A, path))).convert("RGB")
    return ImageOps.fit(im, box, Image.LANCZOS, centering=focus)

def result(m):
    W, H = 1080, 1350
    img = Image.new("RGB", (W, H), BG); stripes(img)
    # hero background photo, faded into the tile
    if m.get("hero"):
        hero = photo_fill(m["hero"], (W, 470), focus=tuple(m.get("hero_focus", [0.5, 0.35])))
        fade = Image.new("L", hero.size, 0); fd = ImageDraw.Draw(fade)
        for y in range(hero.height):
            t = y / hero.height; a = 85 if t < 0.5 else int(85 * (1 - (t - 0.5) / 0.5))
            fd.line([(0, y), (W, y)], fill=max(0, a))
        img.paste(hero, (0, 8), fade)
    d = ImageDraw.Draw(img)
    lg = load("onefm_white.png", (200, 92)); paste(img, lg, ((W - lg.width) // 2, 26))
    d = ImageDraw.Draw(img)
    d.text((W / 2, 150), "   ".join(m["league"].upper()), font=bar(600, 24), fill=GOLD, anchor="mm")
    title = m.get("title_big", "FINAL").upper(); size = 200
    while d.textlength(title, font=anton(size)) > W - 140: size -= 5
    gold_text(img, (W / 2, 400), title, anton(size), anchor="ms")
    script_over(img, (W / 2 - 10, 250), m.get("title_script", "Full Time"), 110)
    d = ImageDraw.Draw(img)
    # score bar
    sy0, sy1 = 425, 545
    d.rounded_rectangle([60, sy0, W - 60, sy1], radius=16, fill=PANEL, outline=GOLD, width=2)
    h, a = m["home"], m["away"]
    hl = load("clubs/" + h["logo"], (96, 92)); al = load("clubs/" + a["logo"], (96, 92))
    paste(img, hl, (84, sy0 + (sy1 - sy0 - hl.height) // 2)); paste(img, al, (W - 84 - al.width, sy0 + (sy1 - sy0 - al.height) // 2))
    d = ImageDraw.Draw(img); cy = (sy0 + sy1) // 2
    for team, xn, xs, anc in ((h, 200, 425, "l"), (a, W - 200, W - 425, "r")):
        d.text((xn, cy - 26), team["name"].upper(), font=bar(800, 34), fill=WHITE, anchor=anc + "m")
        d.text((xn, cy + 14), team.get("detail", ""), font=bar(600, 24), fill=GREY, anchor=anc + "m")
        d.text((xs, cy), str(team["score"]), font=anton(72), fill=GOLD if team.get("winner") else WHITE, anchor=("r" if anc == "l" else "l") + "m")
    d.text((W / 2, cy), m.get("vs", "DEF" if h.get("winner") else "V").upper(), font=bar(700, 24), fill=GOLD, anchor="mm")
    # player of the day + best players
    py0, py1 = 570, 880; lw = 400
    if m.get("potd"):
        p = m["potd"]
        ph = photo_fill(p["photo"], (lw, py1 - py0), focus=tuple(p.get("focus", [0.5, 0.3])))
        fade = Image.new("L", ph.size, 255); fd = ImageDraw.Draw(fade)
        for y in range(ph.height):
            t = max(0, (y / ph.height - 0.5) / 0.5); fd.line([(0, y), (lw, y)], fill=int(255 * (1 - t) ** 1.5))
        base = Image.new("RGB", ph.size, (12, 12, 22)); base.paste(ph, (0, 0), fade)
        msk = Image.new("L", ph.size, 0); ImageDraw.Draw(msk).rounded_rectangle([0, 0, lw - 1, py1 - py0 - 1], radius=14, fill=255)
        img.paste(base, (60, py0), msk); d = ImageDraw.Draw(img)
        d.rounded_rectangle([60, py0, 60 + lw, py1], radius=14, outline=GOLD, width=2)
        if p.get("sponsor_logo"):
            chip_w, chip_h = 150, 46
            d.rounded_rectangle([76, py1 - 128, 76 + chip_w, py1 - 128 + chip_h], radius=8, fill=LIGHT_CHIP)
            sl = load("sponsors/" + p["sponsor_logo"], (chip_w - 16, chip_h - 12)); paste(img, sl, (76 + (chip_w - sl.width) // 2, py1 - 128 + (chip_h - sl.height) // 2)); d = ImageDraw.Draw(img)
        d.text((76, py1 - 72), p.get("label", "Player of the day").upper(), font=bar(600, 22), fill=GOLD)
        d.text((76, py1 - 48), p["name"].upper(), font=anton(36), fill=WHITE)
    bx0 = 60 + lw + 16
    d.rounded_rectangle([bx0, py0, W - 60, py1], radius=14, fill=PANEL, outline=GOLD, width=2)
    d.text((bx0 + 20, py0 + 18), "B E S T   P L A Y E R S", font=bar(600, 22), fill=GOLD)
    d.line([(bx0 + 20, py0 + 50), (W - 80, py0 + 50)], fill=(70, 60, 30), width=1)
    colw = (W - 60 - bx0) // 2
    for i, team in enumerate((h, a)):
        cx = bx0 + 20 + i * colw
        tl = load("clubs/" + team["logo"], (34, 34)); paste(img, tl, (cx, py0 + 62)); d = ImageDraw.Draw(img)
        d.text((cx + 44, py0 + 79), team["name"].upper(), font=bar(700, 22), fill=WHITE, anchor="lm")
        for j, n in enumerate(team.get("best", [])[:6]):
            d.text((cx, py0 + 112 + j * 30), n, font=bar(400, 26), fill=WHITE if j else GOLD)
    # quarter by quarter
    qy0, qy1 = 898, 1078
    d.rounded_rectangle([60, qy0, W - 60, qy1], radius=14, fill=PANEL, outline=GOLD, width=2)
    d.text((80, qy0 + 18), "Q U A R T E R   B Y   Q U A R T E R", font=bar(600, 22), fill=GOLD)
    cols = [560, 660, 760, 860, 975]
    for c, lab in zip(cols, ["Q1", "Q2", "Q3", "Q4", "FINAL"]):
        d.text((c, qy0 + 30), lab, font=bar(600, 20), fill=GREY, anchor="mm")
    d.line([(920, qy0 + 52), (920, qy1 - 14)], fill=(70, 60, 30), width=1)
    for i, team in enumerate((h, a)):
        ry = qy0 + 76 + i * 60
        tl = load("clubs/" + team["logo"], (36, 36)); paste(img, tl, (80, ry - 18)); d = ImageDraw.Draw(img)
        d.text((128, ry), team["name"].upper(), font=bar(700, 22), fill=WHITE, anchor="lm")
        for c, q in zip(cols[:4], team.get("quarters", [])):
            d.text((c, ry), str(q), font=bar(600, 30), fill=WHITE, anchor="mm")
        d.text((cols[4], ry - 8), str(team["score"]), font=anton(30), fill=GOLD if team.get("winner") else WHITE, anchor="mm")
        d.text((cols[4], ry + 16), team.get("detail", ""), font=bar(400, 16), fill=GREY, anchor="mm")
    sponsor_strip(img, 1150, 1216, label_y=1132)
    d = ImageDraw.Draw(img)
    d.text((W / 2, 1258), m.get("footer", "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM.").upper(), font=bar(700, 26), fill=GOLD, anchor="mm")
    d.text((W / 2, 1300), m.get("footer2", "").upper(), font=bar(400, 22), fill=GREY, anchor="mm")
    return img

TEMPLATES = {"preview": preview, "final_score": final_score, "result": result}
def potd(m):
    """Oporto Player of the Day — full-bleed photo, 1080x1350."""
    W, H = 1080, 1350
    ph = ImageOps.exif_transpose(Image.open(os.path.join(A, m["photo"]))).convert("RGB")
    img = ImageOps.fit(ph, (W, H), Image.LANCZOS, centering=tuple(m.get("focus", [0.5, 0.35])))
    # top + bottom gradients for legibility
    ov = Image.new("L", (W, H), 0); od = ImageDraw.Draw(ov)
    for y in range(H):
        t = y / H
        a = int(170 * max(0, (0.18 - t) / 0.18)) if t < 0.18 else (int(235 * min(1, (t - 0.52) / 0.48) ** 1.3) if t > 0.52 else 0)
        od.line([(0, y), (W, y)], fill=a)
    img.paste(Image.new("RGB", (W, H), BG), (0, 0), ov)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 7], fill=GOLD); d.rectangle([0, H - 7, W, H], fill=GOLD)
    lg = load("onefm_white.png", (180, 84)); paste(img, lg, (50, 30)); d = ImageDraw.Draw(img)
    d.text((W - 50, 72), "   ".join(m["league"].upper()), font=bar(600, 22), fill=GOLD, anchor="rm")
    # headline block
    size = 96
    while d.textlength(m["player"].upper(), font=anton(size)) > W - 100: size -= 4
    gold_text(img, (50, 1010), m["player"].upper(), anton(size), anchor="ls")
    script_over(img, (50 + d.textlength("Player of the Day", font=vibes(84)) / 2, 875), "Player of the Day", 84)
    d = ImageDraw.Draw(img)
    d.text((50, 1034), (m["club"] + "  •  " + m["grade"]).upper(), font=bar(700, 34), fill=WHITE)
    if m.get("match_line"): d.text((50, 1080), m["match_line"].upper(), font=bar(400, 26), fill=GREY)
    # sponsor lock-up
    y0 = 1150
    d.rounded_rectangle([50, y0, W - 50, y0 + 110], radius=14, fill=PANEL + (0,), outline=GOLD, width=2)
    d.rounded_rectangle([50, y0, W - 50, y0 + 110], radius=14, fill=(18, 18, 30))
    d.rounded_rectangle([50, y0, W - 50, y0 + 110], radius=14, outline=GOLD, width=2)
    chip_w = 300
    d.rounded_rectangle([70, y0 + 18, 70 + chip_w, y0 + 92], radius=10, fill=LIGHT_CHIP)
    ol = load("sponsors/oporto_black.png", (chip_w - 30, 56)); paste(img, ol, (70 + (chip_w - ol.width) // 2, y0 + 18 + (74 - ol.height) // 2)); d = ImageDraw.Draw(img)
    d.text((70 + chip_w + 30, y0 + 40), "OPORTO PLAYER OF THE DAY", font=bar(700, 28), fill=GOLD, anchor="lm")
    d.text((70 + chip_w + 30, y0 + 76), m.get("footer", "Proudly presented by Oporto Shepparton  •  Live on ONE FM 98.5").upper(), font=bar(400, 20), fill=GREY, anchor="lm")
    return img

TEMPLATES["potd"] = potd



if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    for path in sys.argv[1:]:
        m = json.load(open(path))
        out = os.path.join(HERE, "out", m.get("name", os.path.splitext(os.path.basename(path))[0]) + ".png")
        TEMPLATES[m["template"]](m).save(out, optimize=True)
        print("wrote", out)
