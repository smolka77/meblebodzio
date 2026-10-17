import Link from "next/link";
import { Suspense } from "react";
import { MessageCircle, Mail, Clock, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { ContactForm, ContactInfoCards } from "@/components/strony/FormularzKontaktowy";
import { company } from "@/lib/firma";
import { stronaMeta, jsonLdKontakt } from "@/lib/seo";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getSettings } from "@/lib/serwer/ustawienia";

export const metadata = stronaMeta({
  title: "Kontakt",
  description:
    `Napisz do Wrohaus: dobór mebli do salonu i sypialni, terminy i zamówienia. Biuro w Kątach Wrocławskich, ${company.openingHoursShort}.`,
  path: "/kontakt",
});

export default async function ContactPage() {
  const settings = await getSettings();
  const phone = settings.phone?.trim();

  const quickLinks = [
    {
      icon: Mail,
      label: "Napisz",
      value: company.emailDisplay,
      href: `mailto:${company.email}`,
      sub: company.openingHoursShort,
    },
    ...(phone
      ? [
          {
            icon: Phone,
            label: "Telefon",
            value: phone,
            href: `tel:${phone.replace(/\s/g, "")}`,
            sub: company.openingHoursShort,
          },
        ]
      : []),
    {
      icon: MapPin,
      label: "Adres",
      value: company.street,
      href: "/kontakt",
      sub: `${company.postalCode} ${company.city}`,
    },
    {
      icon: MessageCircle,
      label: "FAQ",
      value: "Najczęstsze pytania",
      href: "/faq",
      sub: "Szybkie odpowiedzi",
    },
    {
      icon: Clock,
      label: "Godziny kontaktu",
      value: company.openingHoursShort,
      href: "/kontakt",
      sub: company.openingHoursDays,
    },
  ];

  return (
    <PageShell
      eyebrow="Pomoc"
      title="Porozmawiajmy o Twoim wnętrzu"
      description="Masz pytanie o produkt, chcesz umówić wizytę lub potrzebujesz indywidualnej wyceny? Jesteśmy tu, aby pomóc."
      heroImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=85"
      path="/kontakt"
    >
      <DaneStrukturalne dane={jsonLdKontakt({ phone })} />
      <section className="relative -mt-8 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {quickLinks.map(({ icon: Icon, label, value, href, sub }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] transition-all hover:shadow-md"
              >
                <Icon
                  className="h-5 w-5 text-sand transition-colors group-hover:text-charcoal"
                  strokeWidth={1.5}
                />
                <p className="mt-4 text-[10px] tracking-[0.2em] text-sand uppercase">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-charcoal">{value}</p>
                <p className="mt-1 text-xs text-sand">{sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ContactInfoCards phone={phone} />
        </div>
      </section>

      <section id="formularz" className="scroll-mt-28 border-t border-taupe/30 bg-cream-light py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <p className="section-kicker tracking-[0.12em] uppercase">
                Formularz kontaktowy
              </p>
              <h2 className="mt-2 font-serif text-3xl text-charcoal">
                Napisz do nas
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-sand">
                Wypełnij formularz, a nasz zespół skontaktuje się z Tobą
                najszybciej jak to możliwe. Obsługujemy zapytania{" "}
                {company.openingHoursDetail}. Odbiór z magazynu, po umówieniu, to
                inne okno: {company.pickupHoursShort}. Biuro nie jest magazynem.
              </p>
              <div className="mt-10 space-y-4 border-t border-taupe/30 pt-10">
                <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                  Często pytają o
                </p>
                {[
                  { text: "Dobór tkaniny i koloru tapicerki", href: "/faq" },
                  { text: "Termin produkcji i dostawy", href: "/dostawa" },
                  { text: "Gwarancja i reklamacje", href: "/gwarancja" },
                  { text: "Finansowanie i płatności ratalne", href: "/faq" },
                ].map((item) => (
                  <Link
                    key={item.text}
                    href={item.href}
                    className="block text-sm text-charcoal/80 transition-colors hover:text-charcoal before:mr-3 before:text-sand before:content-['—']"
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] lg:p-10">
              <Suspense
                fallback={
                  <p className="text-sm text-sand">Ładowanie formularza…</p>
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
