"""Wektorowe PDF z wordmarkiem Wrohaus (Outfit Black + kropka terracotta)."""

from __future__ import annotations

import os
import urllib.request
from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

FONT_URLS = [
    "https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/Outfit-Black.ttf",
    "https://github.com/google/fonts/raw/main/ofl/outfit/Outfit-Black.ttf",
    "https://cdn.jsdelivr.net/gh/fontsource/font-files@main/fonts/outfit/files/outfit-latin-900-normal.woff",
]

CREAM = HexColor("#F8F7F4")
CHARCOAL = HexColor("#111111")
TERRACOTTA = HexColor("#C4512F")
WHITE = HexColor("#FFFFFF")

WORD = "wrohaus"
TRACKING_EM = -0.05
DOT_EM = 0.22
DOT_GAP_EM = 0.12
FONT_SIZE = 96


def ensure_font(dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 40_000:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    last_error: Exception | None = None
    for url in FONT_URLS:
        try:
            urllib.request.urlretrieve(url, dest)
            if dest.stat().st_size > 20_000:
                return dest
        except Exception as err:  # noqa: BLE001
            last_error = err
    raise RuntimeError(f"Nie udało się pobrać Outfit Black: {last_error}")


def tracked_width(text: str, font: str, size: float) -> float:
    extra = size * TRACKING_EM
    width = 0.0
    for i, ch in enumerate(text):
        width += pdfmetrics.stringWidth(ch, font, size)
        if i < len(text) - 1:
            width += extra
    return width


def draw_wordmark(c: canvas.Canvas, cx: float, cy: float, font: str, size: float) -> None:
    extra = size * TRACKING_EM
    text_w = tracked_width(WORD, font, size)
    dot = size * DOT_EM
    gap = size * DOT_GAP_EM
    total_w = text_w + gap + dot
    x = cx - total_w / 2
    # CSS leading-none: linia = 1em; baseline ~ 0.78 od dołu Outfit.
    baseline = cy - size * 0.28
    top = baseline + size * 0.72

    c.setFillColor(CHARCOAL)
    c.setFont(font, size)
    cursor = x
    for i, ch in enumerate(WORD):
        c.drawString(cursor, baseline, ch)
        cursor += pdfmetrics.stringWidth(ch, font, size)
        if i < len(WORD) - 1:
            cursor += extra

    c.setFillColor(TERRACOTTA)
    r = dot / 2
    dot_cx = cursor + gap + r
    dot_cy = top - gap - r
    c.circle(dot_cx, dot_cy, r, stroke=0, fill=1)


def draw_page(c: canvas.Canvas, width: float, height: float, bg: Color, font: str) -> None:
    c.setFillColor(bg)
    c.rect(0, 0, width, height, stroke=0, fill=1)
    draw_wordmark(c, width / 2, height / 2, font, FONT_SIZE)


def main() -> None:
    font_path = Path(r"C:\Users\48661\sofelio\src\lib\czcionki\outfit-900.ttf")
    ensure_font(font_path)
    pdfmetrics.registerFont(TTFont("OutfitBlack", str(font_path)))

    width, height = 840, 320
    desktop = Path(os.path.expanduser(r"~\Desktop"))
    desktop.mkdir(parents=True, exist_ok=True)
    out = desktop / "wrohaus-logo.pdf"

    c = canvas.Canvas(str(out), pagesize=(width, height))
    c.setTitle("Wrohaus — logo")
    c.setAuthor("Wrohaus")

    draw_page(c, width, height, CREAM, "OutfitBlack")
    c.showPage()
    draw_page(c, width, height, WHITE, "OutfitBlack")
    c.save()
    print(out)


if __name__ == "__main__":
    main()
