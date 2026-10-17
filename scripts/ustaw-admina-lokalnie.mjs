/**
 * Lokalne konto panelu (hasło + TOTP). Nie rusza produkcji.
 * Zapis: data/private/auth.env (gitignore). Uruchom ponownie z --force, żeby nadpisać.
 */
import { pbkdf2, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const pbkdf2Async = promisify(pbkdf2);
const ITERS = 310000;
const USER = "admin";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32(buf) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

if (process.env.NODE_ENV === "production") {
  console.error("Odmowa: to jest tylko lokalna konfiguracja panelu.");
  process.exit(1);
}

const root = process.cwd();
const privateDir = path.join(root, "data", "private");
const authFile = path.join(privateDir, "auth.env");
const noteFile = path.join(privateDir, "LOKALNY-ADMIN.txt");
const force = process.argv.includes("--force");

try {
  await fs.access(authFile);
  if (!force) {
    console.error("auth.env już istnieje. Podaj --force, żeby wygenerować nowe lokalne dane.");
    process.exit(1);
  }
} catch {
  /* brak pliku */
}

const password = randomBytes(9).toString("base64url");
const salt = randomBytes(16);
const hash = await pbkdf2Async(password, salt, ITERS, 32, "sha256");
const totp = base32(randomBytes(20));
const sessionSecret = randomBytes(32).toString("hex");

const lines = [
  "# Lokalny panel — skróty, nie plaintext. Nie kopiuj na serwer.",
  `ADMIN_USER=${USER}`,
  `ADMIN_PASS_ITERS=${ITERS}`,
  `ADMIN_PASS_SALT=${salt.toString("base64")}`,
  `ADMIN_PASS_HASH=${hash.toString("base64")}`,
  `ADMIN_TOTP_SECRET=${totp}`,
  `ADMIN_SESSION_SECRET=${sessionSecret}`,
  "",
];

await fs.mkdir(privateDir, { recursive: true });
await fs.writeFile(authFile, lines.join("\n"), { mode: 0o600 });

const issuer = "Meblebodzio-local";
const otpauth = `otpauth://totp/${issuer}:${USER}?secret=${totp}&issuer=${issuer}&digits=6&period=30`;
const note = [
  "Lokalne logowanie do panelu. Tego pliku nie commituj.",
  `Adres: http://127.0.0.1:3000/admin`,
  `Użytkownik: ${USER}`,
  `Hasło: ${password}`,
  `TOTP (base32): ${totp}`,
  `otpauth: ${otpauth}`,
  "",
].join("\n");
await fs.writeFile(noteFile, note, { mode: 0o600 });

console.log(note);
