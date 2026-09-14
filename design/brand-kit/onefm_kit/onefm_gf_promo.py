"""Animated Grand Final promo (10 s) built from onefm_gf_preview layers. Output 1080x1350 MP4.
Usage: python3 onefm_gf_promo.py matches/<file>.json
"""
import json, os, subprocess, sys
from PIL import Image, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import onefm_gf_preview as P
from onefm_tile import A

HERE = os.path.dirname(os.path.abspath(__file__)); FPS = 30; DUR = 10.0
W, H = P.W, P.H
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", str(FPS)]
def ease(t0, d): return f"(1-pow(1-min(max((t-{t0})/{d},0),1),3))"
def run(cmd): subprocess.run(cmd, check=True)

def build(m):
    tmp = os.path.join(HERE, "tmp", "gfpromo"); os.makedirs(tmp, exist_ok=True); out_dir = os.path.join(HERE, "out"); os.makedirs(out_dir, exist_ok=True)
    ls = P.layers(m)
    # hero at 1.12x for the push
    ph = ImageOps.exif_transpose(Image.open(os.path.join(A, m["hero"]))).convert("RGB")
    big = ImageOps.fit(ph, (int(W * 1.12), int(H * 1.12)), Image.LANCZOS, centering=tuple(m.get("hero_focus", [0.5, 0.35])))
    big = Image.eval(big, lambda v: int(v * 0.55)); big.save(f"{tmp}/hero_big.png")
    # vignette + rules as a separate layer (from hero() minus the photo)
    vig = P.hero(m); vig_rgba = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov = Image.new("L", (W, H), 0)
    from PIL import ImageDraw
    od = ImageDraw.Draw(ov)
    for y in range(H):
        t = y / H; a = int(200 * max(0, (0.16 - t) / 0.16)) if t < 0.16 else (int(245 * min(1, (t - 0.42) / 0.5) ** 1.2) if t > 0.42 else 0)
        od.line([(0, y), (W, y)], fill=a)
    vig_rgba.paste(Image.new("RGBA", (W, H), P.BG + (255,)), (0, 0), ov)
    d = ImageDraw.Draw(vig_rgba); d.rectangle([0, 0, W, 8], fill=P.GOLD); d.rectangle([0, H - 8, W, H], fill=P.GOLD); vig_rgba.save(f"{tmp}/vig.png")
    for k in ("top", "headline", "clubs", "details", "sponsors"): ls[k].save(f"{tmp}/{k}.png")
    # split clubs layer into left/right halves so they can slide from opposite sides
    cl = ls["clubs"]; left = cl.crop((0, 0, W // 2, H)); right = cl.crop((W // 2, 0, W, H)); left.save(f"{tmp}/clubs_l.png"); right.save(f"{tmp}/clubs_r.png")
    n = int(DUR * FPS)
    fc = (f"[0:v]zoompan=z='1+0.12*in/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS}[bg];"
          f"[bg][1:v]overlay=0:0[a];"
          f"[2:v]fade=t=in:st=0.3:d=0.5:alpha=1,format=rgba[top];[a][top]overlay=0:0[b];"
          f"[3:v]fade=t=in:st=0.9:d=0.6:alpha=1,format=rgba[hd];[b][hd]overlay=0:'40*(1-{ease(0.9,0.9)})'[c];"
          f"[c][4:v]overlay=x='-{W//2}+{W//2}*{ease(1.9,0.8)}':y=0[d];"
          f"[d][5:v]overlay=x='{W}-{W//2}*{ease(1.9,0.8)}':y=0[e];"
          f"[6:v]fade=t=in:st=2.8:d=0.5:alpha=1,format=rgba[dt];[e][dt]overlay=0:'60*(1-{ease(2.8,0.7)})'[f];"
          f"[7:v]fade=t=in:st=3.4:d=0.6:alpha=1,format=rgba[sp];[f][sp]overlay=0:0[g];"
          f"[g]fade=t=in:st=0:d=0.4,fade=t=out:st={DUR-0.6}:d=0.6,format=yuv420p[v];anullsrc=r=48000:cl=stereo,atrim=duration={DUR}[a_]")
    ins = []
    for f in ("hero_big", "vig", "top", "headline", "clubs_l", "clubs_r", "details", "sponsors"): ins += ["-loop", "1", "-t", str(DUR), "-i", f"{tmp}/{f}.png"]
    final = os.path.join(out_dir, m["name"] + "_promo.mp4")
    run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[v]", "-map", "[a_]", "-t", str(DUR), *ENC, "-c:a", "aac", "-movflags", "+faststart", final])
    print("wrote", final)

if __name__ == "__main__":
    for p in sys.argv[1:]: build(json.load(open(p)))
