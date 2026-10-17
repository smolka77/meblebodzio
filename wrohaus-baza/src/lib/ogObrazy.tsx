import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { przytnij, seo } from "@/lib/seo";

export const ogSize = { width: 1200, height: 630 };

async function fontyOg() {
  const dir = join(process.cwd(), "src", "lib", "czcionki");
  const fonts: {
    name: string;
    data: Buffer;
    weight: 500 | 900;
    style: "normal";
  }[] = [];
  try {
    const black = await readFile(join(dir, "outfit-900.ttf"));
    fonts.push({
      name: "Outfit Black",
      data: black,
      weight: 900,
      style: "normal",
    });
  } catch {
    /* VPS i lokal: bez pliku Satori użyje fallbacku */
  }
  try {
    const medium = await readFile(join(dir, "outfit-500.ttf"));
    fonts.push({
      name: "Outfit Medium",
      data: medium,
      weight: 500,
      style: "normal",
    });
  } catch {
    /* tagline może iść w 900 */
  }
  return fonts;
}

/** Wordmark jak w Logo.tsx: Outfit 900 + tracking -0.05em + kropka terracotta. */
function napisWrohaus(size: number, color: string) {
  const dot = Math.max(8, Math.round(size * 0.22));
  const gap = Math.max(4, Math.round(size * 0.12));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        fontFamily: "Outfit Black",
        fontSize: size,
        fontWeight: 900,
        letterSpacing: Math.round(size * -0.05 * 10) / 10,
        color,
        lineHeight: 1,
      }}
    >
      wrohaus
      <div
        style={{
          width: dot,
          height: dot,
          borderRadius: dot,
          background: "#c4512f",
          marginLeft: gap,
          marginTop: gap,
        }}
      />
    </div>
  );
}

export async function obrazLogoSklepu() {
  const fonts = await fontyOg();
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
          fontFamily: fonts.length ? "Outfit Black" : "sans-serif",
        }}
      >
        {napisWrohaus(220, "#111111")}
      </div>
    ),
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}

export async function obrazMarki(kicker?: string) {
  const fonts = await fontyOg();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8f7f4",
          position: "relative",
          fontFamily: fonts.length ? "Outfit Black" : "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 90,
            width: 220,
            height: 220,
            borderRadius: 220,
            background: "#ede7df",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 70,
            width: 160,
            height: 160,
            borderRadius: 160,
            background: "#d8d0c4",
            opacity: 0.55,
          }}
        />
        {napisWrohaus(132, "#111111")}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontFamily: "Outfit Medium",
            fontSize: 30,
            fontWeight: 500,
            color: "#6f675c",
            letterSpacing: 0.4,
          }}
        >
          {kicker ?? seo.shortTagline}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            fontSize: 18,
            fontFamily: "Outfit Medium",
            fontWeight: 500,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#b8b0a3",
          }}
        >
          salon · sypialnia · cały dom
        </div>
      </div>
    ),
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}

export async function obrazSamoZdjecie(imageSrc: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f8f7f4",
        }}
      >
        <img
          src={imageSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    ogSize
  );
}

export async function obrazZdjecie(opts: {
  imageSrc: string;
  kicker: string;
  tytul: string;
  podpis: string;
}) {
  const fonts = await fontyOg();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#111111",
          overflow: "hidden",
          fontFamily: fonts.length ? "Outfit Black" : "sans-serif",
        }}
      >
        <img
          src={opts.imageSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 56,
            background:
              "linear-gradient(to top, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.35) 48%, transparent 100%)",
          }}
        >
          {napisWrohaus(30, "#f8f7f4")}
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontFamily: "Outfit Medium",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#d8d0c4",
            }}
          >
            {przytnij(opts.kicker, 48)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontFamily: "Outfit Black",
              fontSize: 54,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: -1.5,
            }}
          >
            {przytnij(opts.tytul, 52)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontFamily: "Outfit Medium",
              fontSize: 26,
              fontWeight: 500,
              color: "#ede7df",
            }}
          >
            {przytnij(opts.podpis, 90)}
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}
