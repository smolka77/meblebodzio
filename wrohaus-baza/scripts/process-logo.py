from pathlib import Path

import numpy as np
from PIL import Image

src = Path(
    r"C:\Users\48661\.cursor\projects\c-Users-48661-sofelio\assets\c__Users_48661_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-ccc18087-4887-4124-8785-5f602e43c929.png"
)
out_dir = Path(__file__).resolve().parents[1] / "public" / "brand"
out_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert("RGBA")
arr = np.array(im, dtype=np.float32)
rgb = arr[:, :, :3]

bg = np.array([246.0, 245.0, 241.0])
dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))

alpha = np.clip((dist - 8) / 35.0, 0, 1)
arr[:, :, 3] = (alpha * 255).astype(np.uint8)

mask = arr[:, :, 3] > 0
for c in range(3):
    channel = arr[:, :, c]
    channel = channel.copy()
    channel[~mask] = 0
    arr[:, :, c] = np.clip(channel, 0, 255).astype(np.uint8)

arr = arr.astype(np.uint8)
result = Image.fromarray(arr, "RGBA")

visible = arr[:, :, 3] > 12
ys, xs = np.where(visible)
pad = 2
left, top = max(0, xs.min() - pad), max(0, ys.min() - pad)
right = min(arr.shape[1], xs.max() + pad + 1)
bottom = min(arr.shape[0], ys.max() + pad + 1)
cropped = result.crop((left, top, right, bottom))

logo_path = out_dir / "logo.png"
cropped.save(logo_path, optimize=True)
print("saved", logo_path, cropped.size)

light = np.array(cropped, dtype=np.float32)
lr, lg, lb, la = light[:, :, 0], light[:, :, 1], light[:, :, 2], light[:, :, 3]
lum = 0.299 * lr + 0.587 * lg + 0.114 * lb
content = la > 12

dark = content & (lum < 80)
lr[dark], lg[dark], lb[dark] = 248, 247, 244

mid = content & (lum >= 80) & (lum < 200)
lr[mid], lg[mid], lb[mid] = 216, 208, 196

light = np.stack([lr, lg, lb, la], axis=-1).astype(np.uint8)
light_img = Image.fromarray(light, "RGBA")
light_path = out_dir / "logo-light.png"
light_img.save(light_path, optimize=True)
print("saved", light_path, light_img.size)
