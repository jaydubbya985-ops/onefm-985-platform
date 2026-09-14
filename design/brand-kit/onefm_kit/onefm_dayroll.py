"""ONE FM day roll — mixed video + photo sequence, 16:9 1920x1080.

Usage: python3 onefm_dayroll.py clips/<file>.json
JSON: {name, league_line, open:{script,big,sub}, close:{script,big,sub}, secs (photo default),
       items:[{video:..., start, secs, line1, line2} | {photo:..., focus:[x,y], secs, line1, line2}]}
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageOps, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onefm_tile import A, BG, PANEL, GOLD, WHITE, GREY, anton, bar, vibes, load, paste, gold_text, script_over
from onefm_broadcast import card, bug, ENC, FPS, run, probe_dur, ease, W, H

HERE = os.path.dirname(os.path.abspath(__file__))

def probe_wh(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip().split("\n")[0].split(",")
    w, h = int(o[0]), int(o[1]); rot = int(o[2]) if len(o) > 2 and o[2].strip("-").isdigit() else 0
    return (h, w) if rot in (90, -90, 270) else (w, h)

def plate(line1, line2):
    w, h = 900, 150; img = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    script_over(img, (d.textlength("Grand Final Day", font=vibes(60)) / 2 + 6, 34), "Grand Final Day", 60)
    size = 60
    while d.textlength(line1.upper(), font=anton(size)) > w - 10: size -= 4
    tmp = Image.new("RGB", (w, h), (0, 0, 0)); gold_text(tmp, (4, 118), line1.upper(), anton(size), anchor="ls")
    img.paste(tmp, (0, 0), tmp.convert("L").point(lambda v: 255 if v > 8 else 0)); d = ImageDraw.Draw(img)
    d.text((6, 126), line2.upper(), font=bar(700, 26), fill=WHITE)
    return img

def photo_169(path, focus):
    im = ImageOps.exif_transpose(Image.open(os.path.join(A, path))).convert("RGB")
    cw, ch = int(W * 1.1), int(H * 1.1)
    if im.width / im.height < 1.2:  # portrait photo: blurred fill, photo centred
        bgi = ImageOps.fit(im, (cw, ch), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40)); bgi = Image.eval(bgi, lambda v: int(v * 0.45))
        fg = im.copy(); fg.thumbnail((cw, ch), Image.LANCZOS); bgi.paste(fg, ((cw - fg.width) // 2, (ch - fg.height) // 2)); im = bgi
    else:
        im = ImageOps.fit(im, (cw, ch), Image.LANCZOS, centering=tuple(focus))
    return im

def build(c):
    tmp = os.path.join(HERE, "tmp", "day"); os.makedirs(tmp, exist_ok=True); out_dir = os.path.join(HERE, "out"); os.makedirs(out_dir, exist_ok=True)
    bg_ = bug(); bg_p = f"{tmp}/bug.png"; bg_.save(bg_p); bx, by = W - 40 - bg_.width, H - 40 - bg_.height
    segs = []
    def still(png, dur, name, fade_in=True):
        vf = (f"fade=t=in:st=0:d=0.4," if fade_in else "") + f"fade=t=out:st={dur-0.5}:d=0.5,fps={FPS},format=yuv420p"
        p = f"{tmp}/{name}.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(dur), "-i", png, "-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo", "-vf", vf, "-shortest", *ENC, p]); segs.append(p)
    o = c["open"]; op = f"{tmp}/open.png"; card(c, o.get("script", ""), o["big"], o.get("sub", "")).save(op); still(op, 3.2, "s_open")
    for i, it in enumerate(c["items"]):
        dur = float(it.get("secs", c.get("secs", 4.5))); pl = plate(it.get("line1", ""), it.get("line2", "")); pl_p = f"{tmp}/pl{i}.png"; pl.save(pl_p)
        py = H - 40 - pl.height; p = f"{tmp}/s{i:02d}.mp4"
        ov = (f"[bugi]overlay={bx}:{by}:shortest=1[a];[a][pl]overlay=x='-{pl.width}+({pl.width}+40)*{ease(0.6,0.7)}':y={py}:shortest=1[b];"
              f"[b]fade=t=in:st=0:d=0.3,fade=t=out:st={dur-0.5}:d=0.5,format=yuv420p[v]")
        if "video" in it:
            src = os.path.join(HERE, it["video"]); st = float(it.get("start", 0)); sw, sh = probe_wh(src)
            if sw < sh:  # portrait clip: blurred fill
                base = (f"[0:v]split=2[o1][o2];[o1]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},gblur=sigma=30,eq=brightness=-0.25[bgv];"
                        f"[o2]scale=-2:{H}[fgv];[bgv][fgv]overlay=(W-w)/2:0,fps={FPS},setpts=PTS-STARTPTS[base]")
            else:
                base = f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setpts=PTS-STARTPTS[base]"
            fc = base + f";[base][1:v]" + ov.replace("[bugi]", "") + f";[0:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS,afade=t=out:st={dur-0.5}:d=0.5[a_]"
            fc = fc.replace("[base][1:v]overlay", "[base][1:v]overlay").replace("[a];[a][pl]", "[a];[a][2:v]")
            run(["ffmpeg", "-v", "error", "-y", "-ss", str(st), "-t", str(dur), "-i", src, "-loop", "1", "-t", str(dur), "-i", bg_p, "-loop", "1", "-t", str(dur), "-i", pl_p,
                 "-filter_complex", fc, "-map", "[v]", "-map", "[a_]", "-t", str(dur), *ENC, p])
        else:
            ph = photo_169(it["photo"], it.get("focus", [0.5, 0.4])); ph_p = f"{tmp}/ph{i}.png"; ph.save(ph_p)
            n = int(dur * FPS); z = f"1+0.1*in/{n}" if i % 2 == 0 else f"1.1-0.1*in/{n}"
            fc = (f"[0:v]zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS}[base];[base][1:v]" + ov.replace("[bugi]", "").replace("[a];[a][pl]", "[a];[a][2:v]")
                  + f";anullsrc=r=48000:cl=stereo,atrim=duration={dur}[a_]")
            run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(dur), "-i", ph_p, "-loop", "1", "-t", str(dur), "-i", bg_p, "-loop", "1", "-t", str(dur), "-i", pl_p,
                 "-filter_complex", fc, "-map", "[v]", "-map", "[a_]", "-t", str(dur), *ENC, p])
        segs.append(p)
    o = c["close"]; cp_ = f"{tmp}/close.png"; card(c, o.get("script", ""), o["big"], o.get("sub", ""), strip=True).save(cp_); still(cp_, 4.0, "s_close")
    lst = f"{tmp}/list.txt"; open(lst, "w").write("".join(f"file '{s}'\n" for s in segs))
    final = os.path.join(out_dir, f'{c["name"]}_16x9.mp4')
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final]); print("wrote", final)

if __name__ == "__main__":
    for p in sys.argv[1:]: build(json.load(open(p)))
