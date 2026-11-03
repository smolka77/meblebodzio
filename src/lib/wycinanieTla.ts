/**
 * Wycina jednolite tło ze zdjęcia studyjnego (rozrost obszaru od krawędzi kadru), żeby mebel
 * dało się ustawić na zdjęciu pokoju. Działa tylko w przeglądarce, na zdjęciach z tej samej domeny.
 */

export interface WycinekMebla {
  /** PNG z przezroczystością, przycięty do mebla. */
  url: string;
  width: number;
  height: number;
  /** false — nie udało się odciąć tła, pokazujemy zdjęcie w całości. */
  cutout: boolean;
}

const STEP_LIMIT = 7;
const BG_LIMIT = 58;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Nie udało się wczytać zdjęcia"));
    img.src = src;
  });
}

function maxDiff(a: Uint8ClampedArray, i: number, b: Uint8ClampedArray, j: number): number {
  return Math.max(Math.abs(a[i] - b[j]), Math.abs(a[i + 1] - b[j + 1]), Math.abs(a[i + 2] - b[j + 2]));
}

export async function wytnijTlo(src: string, maxSize = 900): Promise<WycinekMebla> {
  const img = await loadImage(src);
  const ratio = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Brak obsługi canvas");
  ctx.drawImage(img, 0, 0, w, h);
  const image = ctx.getImageData(0, 0, w, h);
  const px = image.data;

  // Kolor tła: średnia z pierścienia przy krawędzi kadru.
  const bg = new Uint8ClampedArray(4);
  {
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    const ring = 3;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x >= ring && x < w - ring && y >= ring && y < h - ring) continue;
        const i = (y * w + x) * 4;
        r += px[i];
        g += px[i + 1];
        b += px[i + 2];
        n += 1;
      }
    }
    bg[0] = r / n;
    bg[1] = g / n;
    bg[2] = b / n;
  }

  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  const seed = (x: number, y: number) => {
    const p = y * w + x;
    if (isBg[p]) return;
    if (maxDiff(px, p * 4, bg, 0) > BG_LIMIT) return;
    isBg[p] = 1;
    queue[tail++] = p;
  };
  for (let x = 0; x < w; x++) {
    seed(x, 0);
    seed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    seed(0, y);
    seed(w - 1, y);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % w;
    const y = (p - x) / w;
    const neighbours = [
      x > 0 ? p - 1 : -1,
      x < w - 1 ? p + 1 : -1,
      y > 0 ? p - w : -1,
      y < h - 1 ? p + w : -1,
    ];
    for (const n of neighbours) {
      if (n < 0 || isBg[n]) continue;
      if (maxDiff(px, n * 4, px, p * 4) > STEP_LIMIT) continue;
      if (maxDiff(px, n * 4, bg, 0) > BG_LIMIT) continue;
      isBg[n] = 1;
      queue[tail++] = n;
    }
  }

  // Alfa z lekkim wygładzeniem krawędzi (średnia 3×3).
  const alpha = new Float32Array(w * h);
  for (let p = 0; p < alpha.length; p++) alpha[p] = isBg[p] ? 0 : 255;
  const soft = new Uint8ClampedArray(w * h);
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let solid = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          sum += alpha[ny * w + nx];
          count += 1;
        }
      }
      const value = sum / count;
      soft[y * w + x] = value;
      if (alpha[y * w + x] > 0) solid += 1;
      if (value > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const coverage = solid / (w * h);
  if (coverage < 0.04 || coverage > 0.92 || maxX <= minX || maxY <= minY) {
    return { url: src, width: img.naturalWidth, height: img.naturalHeight, cutout: false };
  }

  for (let p = 0; p < soft.length; p++) px[p * 4 + 3] = soft[p];
  ctx.putImageData(image, 0, 0);

  const outW = maxX - minX + 1;
  const outH = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  out.getContext("2d")!.drawImage(canvas, minX, minY, outW, outH, 0, 0, outW, outH);
  return { url: out.toDataURL("image/png"), width: outW, height: outH, cutout: true };
}
