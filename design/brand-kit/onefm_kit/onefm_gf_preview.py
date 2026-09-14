"""Grand Final preview tile — hero photo behind, both club crests large, gold script + Anton headline.
Renders as PNG layers so onefm_gf_promo.py can animate the same design.
"""
import os, sys
from PIL import Image, ImageDraw, ImageOps, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onefm_tile import A, BG, PANEL, GOLD, GOLD_LT, WHITE, GREY, RED, LIGHT_CHIP, anton, bar, vibes, load, paste, gold_text, script_over, sponsor_strip, SPONSORS

W, H = 1080, 1350

def hero(m):
    ph = ImageOps.exif_transpose(Image.open(os.path.join(A, m["hero"]))).convert("RGB")
    img = ImageOps.fit(ph, (W, H), Image.LANCZOS, centering=tuple(m.get("hero_focus", [0.5, 0.35])))
    img = Image.eval(img, lambda v: int(v * 0.55))
    # vignette: dark bottom half and top strip so the type reads
    ov = Image.new("L", (W, H), 0); od = ImageDraw.Draw(ov)
    for y in range(H):
        t = y / H
        a = int(200 * max(0, (0.16 - t) / 0.16)) if t < 0.16 else (int(245 * min(1, (t - 0.42) / 0.5) ** 1.2) if t > 0.42 else 0)
        od.line([(0, y), (W, y)], fill=a)
    img.paste(Image.new("RGB", (W, H), BG), (0, 0), ov)
    d = ImageDraw.Draw(img); d.rectangle([0, 0, W, 8], fill=GOLD); d.rectangle([0, H - 8, W, H], fill=GOLD)
    return img

def layer_top(m):
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    lg = load("onefm_white.png", (210, 96)); paste(L, lg, (48, 30))
    d.text((W - 48, 78), "  ".join(m["league"].upper()), font=bar(600, 19), fill=GOLD, anchor="rm")
    if m.get("badge"):
        f = bar(700, 24); pw = d.textlength(m["badge"].upper(), font=f) + 44
        d.rounded_rectangle([W - 48 - pw, 100, W - 48, 140], radius=20, fill=RED); d.text((W - 48 - pw / 2, 120), m["badge"].upper(), font=f, fill=WHITE, anchor="mm")
    return L

def layer_headline(m):
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    big = m["title_big"].upper(); size = 230
    while d.textlength(big, font=anton(size)) > W - 90: size -= 5
    tmp = Image.new("RGB", (W, H), (0, 0, 0)); gold_text(tmp, (W / 2, 700), big, anton(size), anchor="ms")
    L.paste(tmp, (0, 0), tmp.convert("L").point(lambda v: 255 if v > 8 else 0))
    script_over(L, (W / 2 - 12, 505), m["title_script"], 118)
    return L

def layer_clubs(m):
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    y0 = 740; hl = load("clubs/" + m["home"]["logo"], (250, 230)); al = load("clubs/" + m["away"]["logo"], (250, 230))
    hx = 120 + (250 - hl.width) // 2; ax = W - 120 - 250 + (250 - al.width) // 2
    paste(L, hl, (hx, y0 + (230 - hl.height) // 2)); paste(L, al, (ax, y0 + (230 - al.height) // 2)); d = ImageDraw.Draw(L)
    d.text((245, y0 + 262), m["home"]["name"].upper(), font=bar(800, 44), fill=WHITE, anchor="mm")
    d.text((W - 245, y0 + 262), m["away"]["name"].upper(), font=bar(800, 44), fill=WHITE, anchor="mm")
    # gold V on a dark disc
    d.ellipse([W / 2 - 46, y0 + 69, W / 2 + 46, y0 + 161], fill=PANEL, outline=GOLD, width=2)
    d.text((W / 2, y0 + 116), "V", font=anton(56), fill=GOLD, anchor="mm")
    return L

def layer_details(m):
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    y0 = 1050
    d.rounded_rectangle([48, y0, W - 48, y0 + 92], radius=14, fill=PANEL + (235,), outline=GOLD, width=2)
    d.rectangle([48, y0, 60, y0 + 92], fill=GOLD)
    d.text((84, y0 + 30), "   •   ".join(x for x in [m.get("date", ""), m.get("venue", ""), ("BOUNCE " + m["bounce"]) if m.get("bounce") else ""] if x).upper(), font=bar(700, 30), fill=WHITE, anchor="lm")
    d.text((84, y0 + 66), (m.get("on_air_line", "Live call on ONE FM 98.5")).upper(), font=bar(600, 24), fill=GOLD, anchor="lm")
    lg = load("onefm_white.png", (150, 62)); paste(L, lg, (W - 48 - 20 - lg.width, y0 + (92 - lg.height) // 2))
    return L

def layer_sponsors(m):
    L = Image.new("RGB", (W, H), BG).convert("RGBA")
    base = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tmp = Image.new("RGB", (W, H), BG); sponsor_strip(tmp, 1188, 1256, label_y=1170)
    m_ = Image.new("L", (W, H), 0); ImageDraw.Draw(m_).rectangle([0, 1160, W, 1270], fill=255)
    base.paste(tmp, (0, 0), m_)
    d = ImageDraw.Draw(base); d.text((W / 2, 1305), m.get("footer", "LOCAL FOOTY.  LOCAL VOICES.  LIVE ON ONE FM.").upper(), font=bar(700, 26), fill=GOLD, anchor="mm")
    return base

def layers(m):
    return {"hero": hero(m), "top": layer_top(m), "headline": layer_headline(m), "clubs": layer_clubs(m), "details": layer_details(m), "sponsors": layer_sponsors(m)}

def compose(m):
    ls = layers(m); img = ls["hero"].convert("RGBA")
    for k in ("top", "headline", "clubs", "details", "sponsors"): img = Image.alpha_composite(img, ls[k])
    return img.convert("RGB")

if __name__ == "__main__":
    import json
    for p in sys.argv[1:]:
        m = json.load(open(p)); out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", m["name"] + ".png")
        compose(m).save(out, optimize=True); print("wrote", out)
