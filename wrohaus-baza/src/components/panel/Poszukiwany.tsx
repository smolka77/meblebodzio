"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { useWantedTheme } from "@/kontekst/KontekstPoszukiwanego";

const WANTED_CODE = "1234";

export function AdminWanted() {
  const router = useRouter();
  const { unlocked, unlock } = useWantedTheme();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleUnlock(e: FormEvent) {
    e.preventDefault();
    if (code.trim() === WANTED_CODE) {
      setError("");
      unlock();
      return;
    }
    setError("Zły kod.");
  }

  if (!unlocked) {
    return (
      <>
        <AdminHeader title="Kto to kurwa robił?" />
        <div className="admin-page">
          <form
            onSubmit={handleUnlock}
            className="mx-auto max-w-md space-y-4 rounded-xl border border-taupe/30 bg-white p-6"
          >
            <div>
              <h3 className="text-sm font-medium text-charcoal">Kod dostępu</h3>
              <p className="mt-1 text-xs text-sand">
                Wpisz hasło, żeby otworzyć tę zakładkę.
              </p>
            </div>
            <div>
              <label
                htmlFor="wanted-code"
                className="text-xs text-sand uppercase"
              >
                Hasło
              </label>
              <input
                id="wanted-code"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                className="mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
              />
              <p className="mt-2 text-xs text-sand">
                Podpowiedź do hasła: wcale nie 1234 xd
              </p>
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85"
            >
              Wejdź
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Kto to kurwa robił?" />
      <div className="admin-page space-y-6 pb-16">
        <div className="overflow-hidden rounded-xl border-2 border-[#e10600] bg-[#120808] shadow-[0_0_40px_rgba(225,6,0,0.25)]">
          <div className="bg-[#e10600] px-5 py-3 text-center">
            <p className="text-[11px] font-black tracking-[0.35em] text-white uppercase">
              Interpol · Notice rouge
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black tracking-wide text-white uppercase sm:text-3xl">
              Red notice
            </h2>
            <p className="mt-1 text-[11px] tracking-[0.2em] text-white/85 uppercase">
              Osoba poszukiwana międzynarodowo
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-[#e10600] uppercase">
                Poszukiwany
              </p>
              <h3 className="mt-1 font-serif text-4xl text-[#f4eaea]">xmenago</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#d4c4c4]">
                Twórca tego panelu. Oficjalnie „robi sklep z meblami”. Nieoficjalnie
                Interpol wydał czerwoną notę.
              </p>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-[#5a2424] bg-black/40 px-4 py-3">
                  <dt className="text-[10px] tracking-[0.18em] text-[#e10600] uppercase">
                    Status
                  </dt>
                  <dd className="mt-1 font-semibold text-[#f4eaea]">
                    Poszukiwany · nota czerwona
                  </dd>
                </div>
                <div className="rounded-lg border border-[#5a2424] bg-black/40 px-4 py-3">
                  <dt className="text-[10px] tracking-[0.18em] text-[#e10600] uppercase">
                    Zarzuty
                  </dt>
                  <dd className="mt-1 font-semibold text-[#f4eaea]">
                    Narkotyki i porwania
                  </dd>
                </div>
                <div className="rounded-lg border border-[#5a2424] bg-black/40 px-4 py-3 sm:col-span-2">
                  <dt className="text-[10px] tracking-[0.18em] text-[#e10600] uppercase">
                    Numer sprawy
                  </dt>
                  <dd className="mt-1 font-semibold tracking-wide text-[#f4eaea]">
                    INTERPOL-XN-666 / Wrohaus-ADMIN
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-[#d4c4c4]">
                xmenago jest poszukiwany na podstawie czerwonej noty Interpolu za
                zorganizowany handel środkami odurzającymi oraz serię porwań na
                terenie kilku państw. Śledztwo łączy go z nocnymi transportami,
                znikającymi świadkami i operacjami prowadzonymi pod przykrywką
                „projektów internetowych”. Podejrzany wielokrotnie zmieniał
                wygląd, kaptur i okularowy uśmiech do kamery — stąd dwa
                niezależne wizerunki w aktach. Uznaje się, że nie przebywa w
                klasycznym areszcie: jego więzieniem jest komputer, przy którym
                robi tę stronę.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <figure className="overflow-hidden rounded-lg border border-[#5a2424] bg-black">
                <img
                  src="/easter/xmenago-1.jpg"
                  alt="xmenago — zdjęcie do noty Interpolu"
                  className="aspect-[3/4] w-full object-cover object-top grayscale contrast-125 brightness-90"
                />
                <figcaption className="px-2 py-2 text-center text-[10px] tracking-[0.16em] text-[#c4b0b0] uppercase">
                  Mugshot A · frontal
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-lg border border-[#5a2424] bg-black">
                <img
                  src="/easter/xmenago-2.png?v=2"
                  alt="xmenago — drugie zdjęcie do noty Interpolu"
                  className="aspect-[3/4] w-full object-cover object-top grayscale contrast-125 brightness-90"
                />
                <figcaption className="px-2 py-2 text-center text-[10px] tracking-[0.16em] text-[#c4b0b0] uppercase">
                  Mugshot B · uśmiech
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-[#5a2424] bg-[#120808]">
          <div className="border-b border-[#5a2424] px-5 py-3">
            <p className="text-[11px] tracking-[0.22em] text-[#e10600] uppercase">
              Materiał operacyjny
            </p>
            <h3 className="mt-1 font-serif text-xl text-[#f4eaea]">
              Ostatnie nagranie ze strzelaniny w centrum Warszawy, gdzie xmenago
              zabił 20 osób
            </h3>
          </div>
          <div className="bg-black p-3 sm:p-4">
            <video
              className="max-h-[70vh] w-full rounded-lg bg-black"
              src="/easter/xmenago.mov"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem("sofelio-police-alert", "1");
            } catch {
              /* ignore */
            }
            router.push("/admin?zgloszenie=1");
          }}
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#e10600] px-5 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#c10500]"
        >
          Wiem, gdzie on przebywa — kliknij, by zgłosić na policję
        </button>
      </div>
    </>
  );
}
