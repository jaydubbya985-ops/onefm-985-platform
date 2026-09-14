ONE FM 98.5 GRAPHICS KIT
========================
Keep this whole folder. Everything renders from JSON + the assets folder.

TILES   python3 onefm_tile.py matches/<file>.json        -> out/<name>.png
        templates: preview (1080x1080) | final_score (1080x1350) | result (1080x1350)

VIDEO   python3 onefm_broadcast.py clips/<file>.json     -> out/<name>_16x9.mp4   (DEFAULT — full-frame, bug + lower-thirds + score strip)
        python3 onefm_motion.py clips/<file>.json        -> out/<name>_9x16.mp4   (portrait package with cold open, players card, tease)
        python3 onefm_video.py clips/<file>.json         -> simple framed version

Assets: assets/onefm_white.png (dark backgrounds) assets/onefm_blue.png (light) | assets/clubs/<club>.png | assets/sponsors/<name>.png
Add a club: drop the PNG in assets/clubs and reference it in the JSON. Add a sponsor: drop it in assets/sponsors and add it to SPONSORS in onefm_tile.py.
Guest/player photos go in assets/. Clips go in clips/.

Requires: python3, Pillow, numpy, ffmpeg. Best run in Claude Code on desktop so the folder persists.
Example JSONs are in matches/ and clips/ — copy one, change the values, render.
