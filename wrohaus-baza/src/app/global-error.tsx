"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f7f4",
          color: "#111111",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <main>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0 }}>
            Nie udało się wczytać strony
          </h1>
          <p
            style={{
              margin: "1rem auto 0",
              maxWidth: "28rem",
              lineHeight: 1.6,
              color: "rgba(17,17,17,0.7)",
            }}
          >
            Spróbuj odświeżyć. Jeśli wraca, wróć na stronę główną albo do sklepu.
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: 44,
                padding: "0 1.25rem",
                borderRadius: 999,
                border: 0,
                background: "#111111",
                color: "#f8f7f4",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Spróbuj ponownie
            </button>
            <a
              href="/"
              style={{
                minHeight: 44,
                padding: "0 1.25rem",
                borderRadius: 999,
                border: "1px solid #111111",
                color: "#111111",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Strona główna
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
