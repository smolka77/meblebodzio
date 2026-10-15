export type Product = { id: string; name: string; cat: string; price: number; old?: number; img: string; img2: string; colors: string[]; rating: number; reviews: number; badge?: string; dims: string; delivery: string }
export const img = (n: string) => `/img/${n}.jpg`
export const categories = [
  { slug: 'sofy', name: 'Sofy', img: 'sofa-green', count: 214 },
  { slug: 'narozniki', name: 'Narożniki', img: 'sofa-room', count: 132 },
  { slug: 'fotele', name: 'Fotele', img: 'armchair-white', count: 96 },
  { slug: 'lozka', name: 'Łóżka', img: 'u4', count: 120 },
  { slug: 'materace', name: 'Materace', img: 'j1', count: 58 },
  { slug: 'stoly', name: 'Stoły', img: 'dining', count: 87 },
  { slug: 'krzesla', name: 'Krzesła', img: 'chair-black', count: 148 },
  { slug: 'hokery', name: 'Hokery', img: 'stool', count: 41 },
  { slug: 'regaly', name: 'Regały i witryny', img: 'cabinet', count: 64 },
  { slug: 'biurka', name: 'Biurka', img: 'j2', count: 39 },
  { slug: 'oswietlenie', name: 'Oświetlenie', img: 'lamp', count: 63 },
  { slug: 'dekoracje', name: 'Dekoracje', img: 'u1', count: 210 },
]
export const menu = ['Salon', 'Sypialnia', 'Jadalnia', 'Biuro', 'Przedpokój', 'Oświetlenie', 'Dekoracje', 'Ogród']
export const products: Product[] = [
  { id: 'sofa-oslo', name: 'Sofa Oslo 3-osobowa', cat: 'sofy', price: 3299, old: 4199, img: 'sofa-green', img2: 'sofa-room', colors: ['#2f5b4c', '#c9bfb1', '#3d3d3d'], rating: 4.8, reviews: 214, badge: '-21%', dims: '214 × 92 × 84 cm', delivery: '3–5 dni' },
  { id: 'sofa-brera', name: 'Sofa Brera skórzana', cat: 'sofy', price: 5499, img: 'sofa-leather', img2: 'living-bright', colors: ['#a0663c', '#2b2723'], rating: 4.9, reviews: 87, badge: 'Nowość', dims: '228 × 95 × 80 cm', delivery: '7–10 dni' },
  { id: 'fotel-luna', name: 'Fotel Luna', cat: 'fotele', price: 1299, old: 1599, img: 'armchair-yellow', img2: 'living-cream', colors: ['#d9a530', '#6f7d68', '#c9bfb1'], rating: 4.7, reviews: 132, badge: '-19%', dims: '78 × 80 × 86 cm', delivery: '24 h' },
  { id: 'fotel-nube', name: 'Fotel Nube boucle', cat: 'fotele', price: 1749, img: 'armchair-white', img2: 'living-boho', colors: ['#f1ece4', '#c9bfb1'], rating: 4.6, reviews: 58, dims: '72 × 76 × 98 cm', delivery: '3–5 dni' },
  { id: 'krzeslo-eiko', name: 'Krzesło Eiko', cat: 'krzesla', price: 349, old: 449, img: 'chair-black', img2: 'dining', colors: ['#2b2723', '#f1ece4', '#6f7d68'], rating: 4.8, reviews: 421, badge: '-22%', dims: '47 × 53 × 82 cm', delivery: '24 h' },
  { id: 'krzeslo-sola', name: 'Krzesło Sola dębowe', cat: 'krzesla', price: 599, img: 'chair-wood', img2: 'dining', colors: ['#b8875a', '#5a3d2b'], rating: 4.5, reviews: 76, dims: '44 × 50 × 86 cm', delivery: '3–5 dni' },
  { id: 'krzeslo-vela', name: 'Krzesło Vela', cat: 'krzesla', price: 429, img: 'chair-teal', img2: 'dining', colors: ['#2b2723', '#7da3a8'], rating: 4.7, reviews: 190, badge: 'Bestseller', dims: '48 × 54 × 81 cm', delivery: '24 h' },
  { id: 'fotel-arco', name: 'Fotel Arco', cat: 'fotele', price: 899, old: 1099, img: 'chair-white', img2: 'lounge', colors: ['#f1ece4', '#2b2723'], rating: 4.6, reviews: 64, badge: '-18%', dims: '70 × 66 × 78 cm', delivery: '3–5 dni' },
  { id: 'lampa-tove', name: 'Lampa podłogowa Tove', cat: 'oswietlenie', price: 459, img: 'lamp', img2: 'lounge', colors: ['#3d3d3d', '#f1ece4'], rating: 4.9, reviews: 143, dims: 'Ø 30 × 165 cm', delivery: '24 h' },
  { id: 'regal-mira', name: 'Witryna Mira', cat: 'regaly', price: 1899, old: 2299, img: 'cabinet', img2: 'living-orange', colors: ['#c9a77c', '#f1ece4'], rating: 4.7, reviews: 39, badge: '-17%', dims: '80 × 40 × 180 cm', delivery: '7–10 dni' },
  { id: 'hoker-pino', name: 'Hoker Pino', cat: 'krzesla', price: 279, img: 'stool', img2: 'dining', colors: ['#d8c7ad', '#2b2723'], rating: 4.4, reviews: 51, dims: '36 × 36 × 75 cm', delivery: '24 h' },
  { id: 'lozko-alba', name: 'Łóżko tapicerowane Alba', cat: 'lozka', price: 2799, old: 3399, img: 'bedroom', img2: 'bedroom2', colors: ['#c9bfb1', '#6b7a8f'], rating: 4.8, reviews: 98, badge: '-18%', dims: '160 × 200 cm', delivery: '7–10 dni' },
]
export const zl = (n: number) => n.toLocaleString('pl-PL').replace(/\u00a0/g, ' ') + ' zł'
export const descs: Record<string, string> = { sofy: 'Sofa 3-osobowa z funkcją spania, tkanina welurowa łatwa w czyszczeniu', fotele: 'Fotel wypoczynkowy na drewnianych nóżkach, miękkie siedzisko', krzesla: 'Krzesło do jadalni z wyprofilowanym oparciem, stabilna konstrukcja', lozka: 'Łóżko tapicerowane 160x200 z pojemnikiem na pościel', regaly: 'Witryna z przeszklonymi frontami i oświetleniem LED', oswietlenie: 'Lampa podłogowa z regulowanym kloszem, metal malowany proszkowo' }
