import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { PageHero } from "./HeroStrony";
import { DaneStrukturalne } from "./DaneStrukturalne";
import { jsonLdOkuszki } from "@/lib/seo";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  heroImage?: string;
  heroDark?: boolean;
  path?: string;
  children: React.ReactNode;
}

export async function PageShell({
  eyebrow,
  title,
  description,
  heroImage,
  heroDark,
  path,
  children,
}: PageShellProps) {
  return (
    <>
      {path ? (
        <DaneStrukturalne
          dane={jsonLdOkuszki([
            { name: "Strona główna", path: "/" },
            { name: title, path },
          ])}
        />
      ) : null}
      <Header />
      <main>
        <PageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          image={heroImage}
          dark={heroDark}
        />
        {children}
      </main>
      <ShopFooter />
    </>
  );
}
