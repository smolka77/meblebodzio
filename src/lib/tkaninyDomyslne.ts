import type { Fabric } from "./typy";

/** Katalog startowy + dane testowe do podglądu flow styl → kolor. */
export function getDefaultFabrics(): Fabric[] {
  return [
    // —— Boucle (3 odcienie) ——
    {
      id: "fab-boucle-ivory",
      name: "Boucle Ivory",
      description:
        "Miękka boucle w ciepłej tonacji kości słoniowej. Subtelna faktura, idealna do jasnych salonów.",
      material: "Boucle",
      colorHex: "#E8E4DC",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      specs: "Typ tkaniny: boucle\nSkład: 85% wełna, 15% poliamid\nTest Martindale: >40 000 cykli",
      care: "Odkurzać miękką końcówką. Nie pocierać wilgotnych plam.",
      active: true,
    },
    {
      id: "fab-boucle-sand",
      name: "Boucle Sand",
      description:
        "Boucle w piaskowym odcieniu — ciepły, przytulny, świetny do wnętrz boho i japandi.",
      material: "Boucle",
      colorHex: "#C9B89A",
      image:
        "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80",
      active: true,
    },
    {
      id: "fab-boucle-olive",
      name: "Boucle Olive",
      description:
        "Głęboka zieleń oliwkowa na boucle. Wyrazisty akcent kolorystyczny przy zachowaniu miękkości.",
      material: "Boucle",
      colorHex: "#6B705C",
      image:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      active: true,
    },

    // —— Welur (4 odcienie) ——
    {
      id: "fab-welur-stone",
      name: "Welur Stone",
      description:
        "Gęsty welur w kolorze kamienia. Przyjemny w dotyku, odporny na codzienne użytkowanie.",
      material: "Welur",
      colorHex: "#9C9588",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      specs:
        "Typ tkaniny: welur\nSkład: 100% PES\nTest Martindale: >50 000 cykli\nGramatura: 420 g/m²",
      care: "Odkurzać miękką końcówką. Plamy blotować wilgotną ściereczką — nie pocierać.",
      active: true,
    },
    {
      id: "fab-welur-midnight",
      name: "Welur Midnight",
      description:
        "Głęboki granat welurowy. Elegancki, matowy, dobrze maskuje drobne ślady użytkowania.",
      material: "Welur",
      colorHex: "#2C3440",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      active: true,
    },
    {
      id: "fab-welur-terracotta",
      name: "Welur Terracotta",
      description:
        "Ciepły welur w odcieniu terakoty. Świetny do wnętrz z drewnem i mosiądzem.",
      material: "Welur",
      colorHex: "#B56B4A",
      image:
        "https://images.unsplash.com/photo-1617103996700-15c029033763?w=800&q=80",
      active: true,
    },
    {
      id: "fab-welur-sage",
      name: "Welur Sage",
      description:
        "Stonowana szałwia na welurze. Spokojny, naturalny odcień do nowoczesnych aranżacji.",
      material: "Welur",
      colorHex: "#8A9A7B",
      image:
        "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80",
      active: true,
    },

    // —— Len (3 odcienie) ——
    {
      id: "fab-len-natural",
      name: "Len Natural",
      description:
        "Naturalny len w beżowej tonacji. Lekko teksturowany, przewiewny i ponadczasowy.",
      material: "Len",
      colorHex: "#D4C4A8",
      image:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      specs: "Typ tkaniny: len\nSkład: 100% len\nPrzewiewna, przyjazna alergikom",
      active: true,
    },
    {
      id: "fab-len-oat",
      name: "Len Oat",
      description:
        "Len w odcieniu owsianki — jaśniejszy, bardzo uniwersalny do małych i dużych wnętrz.",
      material: "Len",
      colorHex: "#E5DCC8",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      active: true,
    },
    {
      id: "fab-len-slate",
      name: "Len Slate",
      description:
        "Len w chłodnym odcieniu łupka. Nowoczesny, lekko chropowaty charakter.",
      material: "Len",
      colorHex: "#6E7378",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      active: true,
    },

    // —— Mikrofibra (2 odcienie) ——
    {
      id: "fab-micro-graphite",
      name: "Mikrofibra Graphite",
      description:
        "Trwała mikrofibra w grafitowym odcieniu. Łatwa w pielęgnacji, dobra na co dzień.",
      material: "Mikrofibra",
      colorHex: "#4A4A48",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      specs: "Typ tkaniny: mikrofibra\nEasy Clean\nPrzyjazna zwierzętom",
      active: true,
    },
    {
      id: "fab-micro-pearl",
      name: "Mikrofibra Pearl",
      description:
        "Jasna mikrofibra perłowa. Odporna na plamy, idealna do intensywnie używanych mebli.",
      material: "Mikrofibra",
      colorHex: "#F0EDE8",
      image:
        "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80",
      active: true,
    },
  ];
}
