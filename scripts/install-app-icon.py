"""把一张方形 PNG 铺到目标程序 icons 目录里已有的 png，并重写 icon.ico。"""
import sys
from pathlib import Path

from PIL import Image

ICO_SIZES = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]


def main() -> None:
    src_path, dest = Path(sys.argv[1]), Path(sys.argv[2])
    src = Image.open(src_path).convert("RGBA")
    if not dest.is_dir():
        raise SystemExit("图标目录不存在：" + str(dest))
    written = []
    for p in sorted(dest.glob("*.png")):
        with Image.open(p) as old:
            size = old.size
        src.resize(size, Image.Resampling.LANCZOS).save(p, "PNG")
        written.append(p.name)
    if not (dest / "icon.png").exists():
        src.resize((512, 512), Image.Resampling.LANCZOS).save(dest / "icon.png", "PNG")
        written.append("icon.png")
    src.save(dest / "icon.ico", format="ICO", sizes=ICO_SIZES)
    written.append("icon.ico")
    print("\n".join(written))


if __name__ == "__main__":
    main()
