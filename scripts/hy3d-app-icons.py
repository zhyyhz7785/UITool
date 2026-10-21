"""hy3d 应用图标候选。蓝玻璃底板从 HyMd 现用图标抽出来，字和方块画在上面。"""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "hy3d-icons"
HYMD = Path(r"E:\Code\HyMdTauri2\src-tauri\icons\icon.png")
FONT = Path(r"C:\Windows\Fonts\ariblk.ttf")
SIZE = 1024

RED = (224, 108, 90, 255)
GREEN = (91, 196, 138, 255)
BLUE = (76, 155, 255, 255)
WHITE = (246, 246, 247, 255)


def shift(im: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new(im.mode, im.size, (0, 0, 0, 0) if im.mode == "RGBA" else 0)
    out.paste(im, (dx, dy))
    return out


def extract_plate(src: Image.Image) -> Image.Image:
    """按左侧干净蓝列重铺颜色，轮廓和透明边仍用原图。字的投影不会留下印子。"""
    im = src.convert("RGBA")
    px = im.load()
    w, h = im.size
    raw: list[tuple[int, int, int] | None] = [None] * h
    for y in range(h):
        cols = []
        for x in range(36, 68):
            r, g, b, a = px[x, y]
            if a > 220 and b > r + 80 and r < 60:
                cols.append((r, g, b))
        if cols:
            raw[y] = tuple(sum(c[i] for c in cols) // len(cols) for i in range(3))  # type: ignore[assignment]
    last = None
    for y in range(h):
        if raw[y] is None and last:
            raw[y] = last
        elif raw[y]:
            last = raw[y]
    last = None
    for y in range(h - 1, -1, -1):
        if raw[y] is None and last:
            raw[y] = last
        elif raw[y]:
            last = raw[y]
    smooth: list[tuple[int, int, int]] = []
    for y in range(h):
        acc = [0, 0, 0]
        n = 0
        for k in range(y - 3, y + 4):
            if 0 <= k < h and raw[k]:
                for i in range(3):
                    acc[i] += raw[k][i]
                n += 1
        smooth.append(tuple(v // n for v in acc))  # type: ignore[arg-type]
    out = im.copy()
    op = out.load()
    for y in range(h):
        c = smooth[y]
        for x in range(w):
            a = op[x, y][3]
            if a:
                op[x, y] = (*c, a)
    return out


def text_mask(text: str, pixel_h: int, cx: float, cy: float) -> Image.Image:
    lo, hi = 8, 900
    font = ImageFont.truetype(str(FONT), lo)
    for _ in range(18):
        mid = (lo + hi) // 2
        font = ImageFont.truetype(str(FONT), mid)
        bb = font.getbbox(text)
        if bb[3] - bb[1] < pixel_h:
            lo = mid
        else:
            hi = mid
    im = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(im)
    bb = d.textbbox((0, 0), text, font=font)
    x = cx - (bb[0] + bb[2]) / 2
    y = cy - (bb[1] + bb[3]) / 2
    d.text((x, y), text, font=font, fill=255)
    return im


def paint_white(mask: Image.Image, opacity: float = 1) -> Image.Image:
    layer = Image.new("RGBA", (SIZE, SIZE), WHITE)
    layer.putalpha(mask.point(lambda a: int(a * opacity)))
    return layer


def fade_descender(mask: Image.Image, cap_bottom: int, end: int) -> Image.Image:
    """y 的下伸从基线起逐渐淡掉，不留一刀切的平口。"""
    out = mask.copy()
    px = out.load()
    w, h = out.size
    span = max(1, end - cap_bottom)
    for y in range(cap_bottom, h):
        t = (y - cap_bottom) / span
        if t >= 1:
            keep = 0
        else:
            keep = (1 - t) ** 1.6
        for x in range(w):
            if px[x, y]:
                px[x, y] = int(px[x, y] * keep)
    return out


# 视口小方块的三面：顶 #4C9BFF，左 #E8ECF2，右 #5A6678。差只在明暗，不另加一圈色。
CUBE_TOP = (76, 155, 255, 255)
CUBE_LEFT = (232, 236, 242, 255)
CUBE_RIGHT = (90, 102, 120, 255)


def hy_on_cube(hy_h: int, cube_edge: float, hy_opacity: float):
    """方块居中。Hy 压在方块上半部，左右同一条竖轴；y 的长尾向下淡出。"""
    hy = text_mask("Hy", hy_h, SIZE / 2, SIZE / 2)
    bb = hy.getbbox()
    if not bb:
        raise RuntimeError("Hy 没有画出来")
    left, top, _right, bottom = bb
    cap_bottom = top
    for y in range(top, bottom):
        if hy.getpixel((left + 8, y)) > 128:
            cap_bottom = y
    hy = fade_descender(hy, cap_bottom, bottom)
    solid = [(x, y) for y in range(SIZE) for x in range(SIZE) if hy.getpixel((x, y)) > 80]
    if not solid:
        raise RuntimeError("Hy 淡出后没有剩下来")
    xs = [p[0] for p in solid]
    ys = [p[1] for p in solid]
    left, top, right, bottom = min(xs), min(ys), max(xs) + 1, max(ys) + 1
    # 上下顶点距圆角至少 72。再大就会被底板四角切掉。
    cube_edge = min(cube_edge, (SIZE - 144) / 2)
    cy = min(SIZE - 72 - cube_edge, max(72 + cube_edge, SIZE / 2 + 8))
    cube = cube_layer(SIZE / 2, cy, cube_edge, CUBE_TOP, CUBE_LEFT, CUBE_RIGHT)
    cb = cube.getbbox()
    if not cb:
        raise RuntimeError("方块没有画出来")
    # 字的横轴对齐画布中线；竖向落在方块上沿往下约四成，顶面还能露出来。
    dx = int(SIZE / 2 - (left + right) / 2)
    dy = int(cb[1] + (cb[3] - cb[1]) * 0.40 - (top + bottom) / 2)
    hy = shift(hy, dx, dy)
    return cube, paint_white(hy, hy_opacity)


def cube_layer(cx: float, cy: float, edge: float, top, left, right) -> Image.Image:
    c30 = math.cos(math.radians(30))
    s30 = math.sin(math.radians(30))
    raw = {}
    for x in (0, 1):
        for y in (0, 1):
            for z in (0, 1):
                raw[(x, y, z)] = ((x - y) * c30 * edge, (x + y) * s30 * edge - z * edge)
    xs = [p[0] for p in raw.values()]
    ys = [p[1] for p in raw.values()]
    ox = (min(xs) + max(xs)) / 2
    oy = (min(ys) + max(ys)) / 2

    def pt(key):
        x, y = raw[key]
        return (cx + x - ox, cy + y - oy)

    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon([pt(p) for p in ((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1))], fill=right)
    d.polygon([pt(p) for p in ((0, 1, 0), (1, 1, 0), (1, 1, 1), (0, 1, 1))], fill=left)
    d.polygon([pt(p) for p in ((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1))], fill=top)
    return layer


def arrow(draw: ImageDraw.ImageDraw, p0, p1, width: float, fill) -> None:
    x0, y0 = p0
    x1, y1 = p1
    vx, vy = x1 - x0, y1 - y0
    length = math.hypot(vx, vy) or 1
    ux, uy = vx / length, vy / length
    head = width * 1.05
    sx, sy = x1 - ux * head, y1 - uy * head
    draw.line([(x0, y0), (sx, sy)], fill=fill, width=int(width))
    r = width / 2
    draw.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], fill=fill)
    px, py = -uy, ux
    hw = width * 0.72
    draw.polygon([(x1, y1), (sx + px * hw, sy + py * hw), (sx - px * hw, sy - py * hw)], fill=fill)


def axes_layer() -> Image.Image:
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    origin = (512, 590)
    length = 320
    c30 = math.cos(math.radians(30))
    s30 = math.sin(math.radians(30))
    width = 78
    y_end = (origin[0] - length * c30, origin[1] + length * s30)
    x_end = (origin[0] + length * c30, origin[1] + length * s30)
    z_end = (origin[0], origin[1] - length)
    arrow(d, origin, y_end, width, GREEN)
    arrow(d, origin, x_end, width, RED)
    arrow(d, origin, z_end, width, BLUE)
    return layer


def stamped(base: Image.Image, layer: Image.Image, shadow_rgb=(0, 28, 80), blur=14, alpha=0.5, dx=6, dy=16) -> Image.Image:
    mask = layer.split()[3].filter(ImageFilter.GaussianBlur(blur))
    sh = Image.new("RGBA", base.size, (*shadow_rgb, 0))
    sh.putalpha(mask.point(lambda a: min(255, int(a * alpha))))
    out = Image.alpha_composite(base, shift(sh, dx, dy))
    return Image.alpha_composite(out, layer)


def dark_plate(alpha: Image.Image) -> Image.Image:
    """同一块圆角轮廓，填 hy3d 深色，顶上留一条淡高光。"""
    w, h = alpha.size
    grad = Image.new("RGBA", (w, h))
    top = (62, 71, 87)
    bot = (33, 40, 48)
    row = Image.new("RGBA", (w, 1))
    rp = row.load()
    gp = grad.load()
    for y in range(h):
        t = y / (h - 1)
        c = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        for x in range(w):
            rp[x, 0] = (*c, 255)
        # copy row
        for x in range(w):
            gp[x, y] = rp[x, 0]
    gloss = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gl = gloss.load()
    for y in range(int(h * 0.22)):
        a = int(78 * (1 - y / (h * 0.22)) ** 1.4)
        for x in range(w):
            gl[x, y] = (255, 255, 255, a)
    plate = Image.alpha_composite(grad, gloss)
    plate.putalpha(alpha)
    return plate


def up(im: Image.Image) -> Image.Image:
    return im.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(HYMD).convert("RGBA")
    plate512 = extract_plate(src)
    plate = up(plate512)
    dark = up(dark_plate(plate512.split()[3]))
    shutil.copyfile(HYMD, OUT / "00-hymd.png")

    # 512 上 M 的中心约 (255, 277)，加号中心约 (403, 110)。放大到 1024。
    letter_c = (490, 580)
    badge_c = (840, 176)

    icons: list[tuple[str, Image.Image]] = []

    m3 = text_mask("3", 500, *letter_c)
    badge = cube_layer(*badge_c, 96, (255, 255, 255, 255), (214, 222, 234, 255), (158, 172, 192, 255))
    icons.append(("01-letter-cube.png", stamped(stamped(plate, paint_white(m3)), badge, blur=8, alpha=0.45, dx=3, dy=8)))

    t3d = text_mask("3D", 440, 512, 530)
    icons.append(("02-letters-3d.png", stamped(plate, paint_white(t3d))))

    cube = cube_layer(512, 530, 280, (255, 255, 255, 255), (206, 216, 230, 255), (148, 162, 184, 255))
    icons.append(("03-white-cube.png", stamped(plate, cube)))

    h = text_mask("H", 500, *letter_c)
    small = text_mask("3", 150, *badge_c)
    icons.append(("04-letter-h.png", stamped(stamped(plate, paint_white(h)), paint_white(small), blur=8, alpha=0.45, dx=3, dy=8)))

    dcube = cube_layer(512, 530, 300, BLUE, (232, 236, 242, 255), (90, 102, 120, 255))
    icons.append(("05-dark-cube.png", stamped(dark, dcube, shadow_rgb=(0, 0, 0), alpha=0.45)))

    icons.append(("06-dark-axes.png", stamped(dark, axes_layer(), shadow_rgb=(0, 0, 0), alpha=0.4, blur=10, dy=10)))

    # Hy 白字压在带色方块上。07 字更大，09 方块顶到圆角内侧、字小一号。
    cube, letters = hy_on_cube(340, 400, 1)
    icons.append(("07-hy-cube-above.png", stamped(stamped(plate, cube, blur=12, alpha=0.28, dy=10), letters, blur=8, alpha=0.4, dx=2, dy=6)))
    cube, letters = hy_on_cube(250, 440, 1)
    icons.append(("09-hy-cube-corner.png", stamped(stamped(plate, cube, blur=12, alpha=0.28, dy=10), letters, blur=8, alpha=0.4, dx=2, dy=6)))

    hy_stack = text_mask("Hy", 390, 512, 650)
    three_above = text_mask("3", 170, 512, 230)
    icons.append(("08-hy-3-above.png", stamped(stamped(plate, paint_white(hy_stack)), paint_white(three_above), blur=8, alpha=0.45, dx=3, dy=8)))
    hy_corner = text_mask("Hy", 420, 470, 600)
    three_corner = text_mask("3", 150, *badge_c)
    icons.append(("10-hy-3-corner.png", stamped(stamped(plate, paint_white(hy_corner)), paint_white(three_corner), blur=8, alpha=0.45, dx=3, dy=8)))

    for name, im in icons:
        im.save(OUT / name, "PNG")
        print(name, im.size)


if __name__ == "__main__":
    main()
