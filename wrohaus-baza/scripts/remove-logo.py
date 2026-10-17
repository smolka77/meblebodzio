"""Remove SOFELIO logo from hero image using OpenCV inpainting."""
from pathlib import Path

import cv2
import numpy as np

SRC = Path(
    r"C:\Users\48661\.cursor\projects\c-Users-48661-sofelio\assets"
    r"\c__Users_48661_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-c810aaf3-d4ab-420e-9e63-8b2a04c54856.png"
)
OUT = Path(r"C:\Users\48661\sofelio\public\hero-sofelio.png")

img = cv2.imread(str(SRC))
h, w = img.shape[:2]

mask = np.zeros((h, w), dtype=np.uint8)

# Logo + tagline region on wall
cv2.rectangle(mask, (int(w * 0.30), int(h * 0.04)), (int(w * 0.70), int(h * 0.50)), 255, -1)

# Right-edge watermark
cv2.rectangle(mask, (int(w * 0.91), 0), (w, h), 255, -1)

# Inpaint logo area (Telea works well on flat walls)
result = cv2.inpaint(img, mask, inpaintRadius=8, flags=cv2.INPAINT_TELEA)

# Light pass to soften inpaint seams
result = cv2.GaussianBlur(result, (0, 0), 0.4)
result = cv2.addWeighted(img, 0.15, result, 0.85, 0)

# Re-inpaint only masked zone with final blend
final = img.copy()
final[mask == 255] = result[mask == 255]

cv2.imwrite(str(OUT), final, [cv2.IMWRITE_PNG_COMPRESSION, 3])
print(f"Saved {OUT} ({w}x{h})")
