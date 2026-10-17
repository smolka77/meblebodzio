import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Wrohaus";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function AppleIcon() {
  let fonts: { name: string; data: Buffer; weight: 900; style: "normal" }[] = [];
  try {
    fonts = [
      {
        name: "Outfit Black",
        data: await readFile(
          join(process.cwd(), "src", "lib", "czcionki", "outfit-900.ttf")
        ),
        weight: 900,
        style: "normal",
      },
    ];
  } catch {
    fonts = [];
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f7f4",
          borderRadius: 40,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: fonts.length ? "Outfit Black" : "sans-serif",
            fontSize: 92,
            fontWeight: 900,
            color: "#111111",
            letterSpacing: -6,
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          w
        </div>
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 22,
            height: 22,
            borderRadius: 22,
            background: "#c4512f",
          }}
        />
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
