from pathlib import Path
import re

svg = Path(__file__).resolve().parents[1] / "public" / "brand" / "poland-wiki.svg"
text = svg.read_text(encoding="utf-8")
path_match = re.search(r'\sd="([^"]+)"', text)
path = path_match.group(1)

out = Path(__file__).resolve().parents[1] / "src" / "components" / "icons" / "polandOutlinePath.ts"
out.write_text(
    "// Obrys Polski — Wikimedia Commons, public domain (Marcin dome Dabrowski)\n"
    f"export const POLAND_OUTLINE_PATH = {path!r};\n"
    "export const POLAND_OUTLINE_TRANSFORM = \"translate(-155.9,-51.03718)\";\n",
    encoding="utf-8",
)
print("written", out, "path length", len(path))
