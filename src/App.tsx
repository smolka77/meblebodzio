import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, products, img, zl, descs, type Product } from './data'
const mainCats = categories.filter(c => ['sofy', 'narozniki', 'fotele', 'lozka', 'stoly', 'krzesla'].includes(c.slug))
import * as I from './icons'

function useRoute() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => { const f = () => { setH(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h
}

export default function App() {
  const route = useRoute()
  const [cart, setCart] = useState(0)
  const [toast, setToast] = useState('')
  const add = (p: Product) => { setCart(c => c + 1); setToast(`Dodano do koszyka: ${p.name}`); setTimeout(() => setToast(''), 2400) }
  const parts = route.split('/').filter(Boolean)
  let page
  if (parts[0] === 'kategoria') page = <Category slug={parts[1]} add={add} />
  else if (parts[0] === 'produkt') page = <ProductPage id={parts[1]} add={add} />
  else page = <Home add={add} />
  return (
    <div className="min-h-screen flex flex-col">
      <Header cart={cart} />
      <main className="flex-1" key={route}><div className="fade-up">{page}</div></main>
      <Footer />
      <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-3 rounded-full bg-accent text-white px-5 py-3 text-sm font-semibold shadow-xl"><I.Check className="w-4 h-4 text-sun" />{toast}</div>
      </div>
    </div>
  )
}

const W = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`pw ${className}`}>{children}</div>
const H2 = ({ children, className = '', link }: { children: React.ReactNode; className?: string; link?: string }) => <div className={`flex items-end justify-between gap-4 ${className}`}><h2 className="font-display text-[22px] sm:text-[28px] leading-tight">{children}</h2>{link && <a href="#/kategoria/sofy" className="group shrink-0 flex items-center gap-1 text-[14px] font-semibold pb-1 border-b-2 border-sun hover:border-ink transition">{link}<I.Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition" /></a>}</div>
const Btn = ({ children, className = '', onClick, href }: { children: React.ReactNode; className?: string; onClick?: () => void; href?: string }) => {
  const c = `inline-flex items-center justify-center gap-2 h-[50px] px-8 rounded-full bg-accent text-white text-[15px] font-semibold hover:bg-[#2a2a2a] active:scale-[.98] transition ${className}`
  return href ? <a href={href} className={c}>{children}</a> : <button onClick={onClick} className={c}>{children}</button>
}

const navItems = ['Salon', 'Sypialnia', 'Jadalnia', 'Krzesła', 'Oświetlenie', 'Dodatki', 'Nowości', 'Promocje']

function Header({ cart }: { cart: number }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-line">
      <div className="bg-forest text-white/85 text-[12.5px]">
        <W className="flex items-center justify-between h-9">
          <span>Darmowa dostawa od 999 zł · 30 dni na zwrot</span>
          <span className="hidden md:flex gap-6"><a className="ulink cursor-pointer">Status zamówienia</a><a className="ulink cursor-pointer">Pomoc</a><span>71 123 45 67</span></span>
        </W>
      </div>
      <W className="flex items-center gap-5 lg:gap-10 h-[68px] lg:h-[88px]">
        <button className="lg:hidden -ml-1 p-1" onClick={() => setOpen(!open)} aria-label="Menu"><I.Menu className="w-7 h-7" /></button>
        <a href="#/" className="text-[28px] lg:text-[36px] font-bold tracking-[-0.05em] leading-none shrink-0">sklep<span className="text-accent">.</span></a>
        <label className="hidden lg:flex flex-1 max-w-[680px] items-center gap-3 h-[52px] rounded-full bg-soft border border-transparent px-6 focus-within:bg-white focus-within:border-ink transition">
          <I.Search className="w-5 h-5" /><input className="flex-1 min-w-0 bg-transparent outline-none text-[16px] placeholder:text-meta" placeholder="Czego szukasz? Np. sofa rozkładana, krzesło dębowe…" />
        </label>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <button className="lg:hidden p-1.5" aria-label="Szukaj"><I.Search className="w-6 h-6" /></button>
          {[[I.User, 'Konto'], [I.Heart, 'Ulubione']].map(([Ic, l]: any) => <button key={l} className="hidden sm:flex flex-col items-center gap-1 px-2 text-[13px] font-semibold hover:text-accent transition"><Ic className="w-[26px] h-[26px]" />{l}</button>)}
          <button className="relative flex flex-col items-center gap-1 px-2 text-[13px] font-semibold hover:text-accent transition" aria-label="Koszyk"><I.Bag className="w-[26px] h-[26px]" /><span className="hidden sm:block">Koszyk</span>
            {cart > 0 && <span key={cart} className="absolute -top-1 right-0 min-w-[19px] h-[19px] px-1 rounded-full bg-accent text-white text-[11px] font-bold grid place-items-center fade-up">{cart}</span>}</button>
        </div>
      </W>
      <nav className={`${open ? 'block' : 'hidden'} lg:block border-t border-line`}>
        <W className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-9 py-3 lg:py-0 lg:h-[54px] text-[16px] font-semibold">
          {navItems.map(m => <a key={m} href="#/kategoria/sofy" onClick={() => setOpen(false)} className={`relative py-2 lg:py-0 lg:h-full flex items-center hover:text-accent transition after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-accent hover:after:w-full after:transition-all ${m === 'Promocje' ? 'text-accent' : ''}`}>{m}</a>)}
          <span className="hidden lg:flex ml-auto items-center gap-2 text-[14px] font-medium text-meta"><I.Truck className="w-5 h-5 text-forest" />Wysyłka 24 h dla 400+ modeli</span>
        </W>
      </nav>
    </header>
  )
}

function ProductCard({ p, add }: { p: Product; add: (p: Product) => void }) {
  const [liked, setLiked] = useState(false)
  const disc = p.badge?.startsWith('-')
  return (
    <div className="group">
      <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-soft">
        <a href={`#/produkt/${p.id}`}>
          <img src={img(p.img)} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0" />
          <img src={img(p.img2)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        </a>
        {p.badge && <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[12px] font-medium ${disc ? 'bg-accent text-white' : 'bg-white text-ink'}`}>{disc ? 'Promocja' : p.badge}</span>}
        <button onClick={() => setLiked(!liked)} aria-label="Ulubione" className="absolute top-2.5 right-2.5 p-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition"><I.Heart className={`w-5 h-5 ${liked ? 'fill-ink' : ''}`} /></button>
        <button onClick={() => add(p)} className="absolute left-3 right-3 bottom-3 h-10 rounded-full bg-white text-ink text-[13.5px] font-medium hidden lg:flex items-center justify-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300 hover:bg-ink hover:text-white">Dodaj do koszyka</button>
      </div>
      <div className="pt-3.5">
        <div className="flex justify-between gap-3 items-start">
          <a href={`#/produkt/${p.id}`} className="text-[15px] font-medium leading-snug">{p.name}</a>
          <button onClick={() => add(p)} aria-label="Do koszyka" className="lg:hidden shrink-0 p-1"><I.Bag className="w-[18px] h-[18px]" /></button>
        </div>
        <div className="clamp1 text-[13.5px] text-meta mt-0.5">{p.colors.length} {p.colors.length > 1 ? 'kolory' : 'kolor'} · {p.dims}</div>
        <div className="flex items-baseline gap-2 mt-2"><span className="text-[16px] font-semibold">{zl(p.price)}</span>{p.old && <span className="text-[13.5px] text-meta line-through">{zl(p.old)}</span>}</div>
        {p.old && <div className="text-[11.5px] text-meta mt-0.5">Najniższa cena z 30 dni: {zl(Math.round(p.old * 0.95))}</div>}
      </div>
    </div>
  )
}

const Grid = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-10 sm:gap-y-12">{children}</div>
const Sec = ({ title, link, children, className = '' }: { title: string; link?: string; children: React.ReactNode; className?: string }) => <section className={`pt-20 lg:pt-28 ${className}`}><W>
  <div className="flex items-end justify-between gap-4 mb-8 lg:mb-10"><h2 className="font-display text-[26px] sm:text-[34px] leading-tight">{title}</h2>{link && <a href="#/kategoria/sofy" className="ulink shrink-0 text-[14.5px] font-medium text-accent flex items-center gap-1.5">{link}<I.Arrow className="w-4 h-4" /></a>}</div>
  {children}</W></section>

function Benefits() {
  const items = [[I.Truck, 'Wysyłka w 24 h', '400+ modeli z magazynu we Wrocławiu'], [I.Return, '30 dni na zwrot', 'Bez podawania przyczyny'], [I.Card, 'Raty 0%', '20 rat, decyzja w 15 minut'], [I.Shield, '5 lat gwarancji', 'Na stelaże i konstrukcje']] as const
  return <W className="pt-6 lg:pt-8"><div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 py-6 border-y border-line">
    {items.map(([Ic, t, s]) => <div key={t} className="flex items-center gap-3.5"><span className="w-10 h-10 rounded-full bg-sage text-forest grid place-items-center shrink-0"><Ic className="w-5 h-5" /></span><div><div className="text-[14.5px] font-semibold">{t}</div><div className="text-[13px] text-meta">{s}</div></div></div>)}
  </div></W>
}

const spots = [
  { x: 47, y: 52, n: 'Sofa Marlo 3-osobowa', d: 'Welur, 5 kolorów', pr: 2899, old: 3499, i: 'sofa-room', href: '#/produkt/sofa-oslo' },
  { x: 27, y: 60, n: 'Poduszka Linea 45×45', d: 'Len z bawełną', pr: 89, i: 'u1', href: '#/kategoria/sofy' },
  { x: 52, y: 80, n: 'Stolik kawowy Oak', d: 'Lite drewno dębowe', pr: 749, i: 'sofa-room', href: '#/kategoria/stoly' },
  { x: 95, y: 40, n: 'Lampa podłogowa Tove', d: 'Metal i len', pr: 459, i: 'lamp', href: '#/produkt/lampa-tove' },
]

function ShopTheLook() {
  const [act, setAct] = useState<number | null>(0)
  return <section className="bg-sage pb-16 lg:pb-24"><W><div className="border-t border-forest/10 pt-14 lg:pt-20">
    <div className="grid lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr] gap-10 lg:gap-16 items-center">
      <div>
        <div className="text-[13px] font-medium text-meta">Kup cały look</div>
        <h2 className="font-display text-[30px] sm:text-[42px] leading-[1.05] tracking-[-0.035em] mt-3">Salon w odcieniach szarości</h2>
        <p className="mt-5 text-[16px] leading-relaxed">Kliknij punkty na zdjęciu i zobacz, co jest w tym wnętrzu. Każdy produkt kupisz osobno albo cały zestaw z rabatem 10%.</p>
        <ul className="mt-7 border-t border-forest/15">{spots.map((sp, i) => <li key={i}><button onMouseEnter={() => setAct(i)} onClick={() => setAct(i)} className={`w-full flex items-center gap-3 py-3.5 border-b border-forest/15 text-left transition ${act === i ? '' : 'opacity-60 hover:opacity-100'}`}>
          <span className={`w-6 h-6 rounded-full text-[12px] font-semibold grid place-items-center ${act === i ? 'bg-forest text-white' : 'bg-white'}`}>{i + 1}</span>
          <span className="flex-1 text-[14.5px] font-medium">{sp.n}</span><span className="text-[14.5px] font-semibold">{zl(sp.pr)}</span></button></li>)}</ul>
        <div className="mt-6 flex items-center justify-between"><div><div className="text-[13px] text-meta">Cały zestaw</div><div className="text-[20px] font-semibold">{zl(Math.round(spots.reduce((a, b) => a + b.pr, 0) * 0.9))} <span className="text-[14px] text-meta line-through font-normal">{zl(spots.reduce((a, b) => a + b.pr, 0))}</span></div></div>
          <a href="#/kategoria/sofy" className="h-12 px-6 rounded-full bg-accent text-white text-[15px] font-medium grid place-items-center hover:bg-accent-dark transition">Kup zestaw</a></div>
      </div>
      <div className="relative rounded-md overflow-hidden aspect-[3/2]" onMouseLeave={() => {}}>
        <img src={img('sofa-room')} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {spots.map((sp, i) => <div key={i} className="absolute" style={{ left: `${sp.x}%`, top: `${sp.y}%` }}>
          <button onClick={() => setAct(act === i ? null : i)} onMouseEnter={() => setAct(i)} aria-label={sp.n} className="relative -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-[0_4px_14px_rgba(0,0,0,.25)] grid place-items-center hover:scale-110 transition">
            <span className={`w-2.5 h-2.5 rounded-full bg-ink transition ${act === i ? 'scale-150' : ''}`} />
            {act !== i && <span className="absolute inset-0 rounded-full ring-2 ring-white/70 animate-ping" />}
          </button>
          {act === i && <a href={sp.href} className={`absolute top-6 ${sp.x > 60 ? 'right-2' : 'left-2'} w-[250px] bg-white rounded-md shadow-[0_14px_40px_-12px_rgba(0,0,0,.35)] p-3 flex gap-3 fade-up z-10`}>
            <img src={img(sp.i)} alt="" className="w-16 h-16 rounded object-cover" />
            <div className="min-w-0"><div className="text-[14px] font-semibold leading-snug">{sp.n}</div><div className="text-[12.5px] text-meta">{sp.d}</div><div className="mt-1 text-[14px] font-semibold">{zl(sp.pr)} {sp.old && <span className="text-meta line-through font-normal text-[12.5px]">{zl(sp.old)}</span>}</div></div>
            <I.Chevron className="w-4 h-4 self-center shrink-0" />
          </a>}
        </div>)}
      </div>
    </div>
  </div></W></section>
}

function PromoPair() {
  const b = [['living-orange', 'Fotele do −20%', 'Kolor, który ociepla salon', 'Zobacz fotele', 'fotele'], ['bedroom2', 'Tydzień sypialni', 'Łóżka tapicerowane z pojemnikiem od 1899 zł', 'Zobacz łóżka', 'lozka']]
  return <W className="pt-20 lg:pt-28"><div className="grid md:grid-cols-2 gap-4 lg:gap-6">
    {b.map(([i, t, s, c, h]) => <a key={i} href={`#/kategoria/${h}`} className="group relative rounded-md overflow-hidden aspect-[4/3] lg:aspect-[16/11]">
      <img src={img(i)} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition duration-[1000ms]" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
      <div className="absolute left-6 right-6 bottom-6 lg:left-9 lg:bottom-9 text-white"><div className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.035em] leading-tight">{t}</div><div className="text-[15px] mt-1 opacity-95">{s}</div>
        <span className="inline-flex mt-5 h-11 px-6 rounded-full bg-white text-ink text-[14.5px] font-medium items-center gap-2">{c}<I.Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition" /></span></div>
    </a>)}
  </div></W>
}

function Brand() {
  return <section className="mt-20 lg:mt-28 bg-forest text-white py-16 lg:py-24"><W><div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
    <div className="relative">
      <img src={img('living-boho')} alt="" className="w-full aspect-[5/4] object-cover rounded-md" />
      <div className="absolute -bottom-6 right-6 lg:-right-8 w-[120px] h-[120px] rounded-full bg-accent text-white grid place-items-center text-center text-[12.5px] leading-tight font-medium rotate-[-8deg] shadow-lg">Projekt<br />i jakość<br /><b className="text-[15px]">z Polski</b></div>
    </div>
    <div className="max-w-[520px]">
      <div className="text-[13px] font-medium text-[#c9d6c4]">Sklep Design</div>
      <h2 className="font-display text-[30px] sm:text-[42px] leading-[1.05] tracking-[-0.035em] mt-3">Autorska kolekcja, zaprojektowana we Wrocławiu</h2>
      <p className="mt-5 text-[16px] leading-relaxed text-white/85">Każdy model zaczynamy od szkicu w naszym studiu, a kończymy w małych polskich manufakturach. Testujemy pianki, tkaniny i stelaże, żeby mebel służył Ci latami, a nie sezon.</p>
      <div className="grid grid-cols-3 gap-6 mt-9 py-6 border-y border-white/20">{[['120+', 'autorskich modeli'], ['14', 'polskich manufaktur'], ['4,8', 'średnia ocen']].map(([a, b]) => <div key={b}><div className="text-[30px] sm:text-[36px] font-semibold tracking-[-0.04em] leading-none">{a}</div><div className="text-[13px] text-white/70 mt-2">{b}</div></div>)}</div>
      <a href="#/kategoria/sofy" className="inline-flex mt-8 h-12 px-7 rounded-full bg-white text-forest text-[15px] font-semibold items-center hover:bg-sand transition">Poznaj kolekcję</a>
    </div>
  </div></W></section>
}

const reviews = [
  ['Anna', 'Wrocław', 'Sofa Oslo', 'Kolor na żywo jeszcze ładniejszy niż na zdjęciach. Siedzi się rewelacyjnie.'],
  ['Marek', 'Poznań', 'Krzesło Eiko', 'Sześć krzeseł dotarło w dwa dni, montaż zajął kwadrans.'],
  ['Kasia', 'Kraków', 'Łóżko Alba', 'Stelaż solidny, pojemnik ogromny. Polecam każdemu.'],
  ['Tomasz', 'Gdańsk', 'Fotel Luna', 'Kurier wniósł na 4. piętro bez windy. Pełen profesjonalizm.'],
  ['Ola', 'Łódź', 'Lampa Tove', 'Świetna jakość wykonania, daje bardzo przyjemne światło.'],
  ['Paweł', 'Warszawa', 'Witryna Mira', 'Wygląda drożej, niż kosztowała. Szkło bez zarzutu.'],
  ['Magda', 'Lublin', 'Fotel Nube', 'Boucle jest miękkie i nie mechaci się po pół roku.'],
  ['Piotr', 'Katowice', 'Sofa Brera', 'Skóra pięknie pachnie, obsługa odpowiadała w kilka minut.'],
  ['Ewa', 'Szczecin', 'Hoker Pino', 'Prosty, stabilny i idealnie pasuje do wyspy w kuchni.'],
]

function Reviews() {
  const Card = ({ r }: { r: string[] }) => <figure className="shrink-0 w-[300px] sm:w-[340px] mr-4 bg-white/[0.06] border border-white/10 text-white rounded-md px-5 py-4">
    <div className="flex items-center justify-between"><span className="flex text-accent">{[1, 2, 3, 4, 5].map(i => <I.Star key={i} className="w-3.5 h-3.5" />)}</span><span className="text-[12px] text-white/60">{r[2]}</span></div>
    <blockquote className="mt-2 text-[14px] leading-snug line-clamp-2">„{r[3]}”</blockquote>
    <figcaption className="mt-2 text-[12.5px]"><b className="font-semibold">{r[0]}</b> <span className="text-white/60">· {r[1]}</span></figcaption>
  </figure>
  return <section className="mt-20 lg:mt-28 bg-[#111] text-white pt-10 lg:pt-12 pb-10 lg:pb-12 overflow-hidden">
    <W className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
      <div className="shrink-0 lg:w-[220px]">
        <div className="text-[13px] font-medium text-white/60">Opinie klientów</div>
        <div className="mt-1 flex items-baseline gap-2"><span className="text-[34px] font-semibold tracking-[-0.04em] leading-none">4,8/5</span><span className="flex text-accent">{[1, 2, 3, 4, 5].map(i => <I.Star key={i} className="w-4 h-4" />)}</span></div>
        <div className="text-[13.5px] mt-1">2 300+ zweryfikowanych opinii</div>
      </div>
      <div className="marquee relative flex-1 min-w-0 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max">{[...reviews, ...reviews].map((r, i) => <Card key={i} r={r} />)}</div>
      </div>
    </W>
  </section>
}

function Guides() {
  const g = [['b2', 'Sypialnia', 'Jak wybrać materac do pozycji, w której śpisz', '6 min'], ['b3', 'Salon', 'Ciepły minimalizm: 7 zasad, które działają w małym mieszkaniu', '8 min'], ['living-bright', 'Poradnik', 'Sofa czy narożnik? Wymiary, które warto sprawdzić przed zakupem', '5 min']]
  return <Sec title="Poradnik sklep" link="Wszystkie artykuły">
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">{g.map(([i, c, t, m]) => <a key={i} href="#/" className="group">
      <div className="aspect-[3/2] rounded-md overflow-hidden"><img src={img(i)} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700" /></div>
      <div className="mt-4 flex gap-2 text-[13px] text-meta"><span className="font-medium text-ink">{c}</span>·<span>{m} czytania</span></div>
      <div className="mt-1.5 text-[18px] sm:text-[20px] font-semibold leading-snug tracking-[-0.02em] group-hover:underline underline-offset-4 decoration-1">{t}</div>
    </a>)}</div>
  </Sec>
}

// Line icons: Lucide (ISC) sofa / armchair / bed-double; narożnik, stół, krzesło drawn on the same 24px grid & stroke
const catIcon: Record<string, React.ReactNode> = {
  sofy: <><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M4 18v2" /><path d="M20 18v2" /><path d="M12 4v9" /></>,
  fotele: <><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M5 18v2" /><path d="M19 18v2" /></>,
  lozka: <><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" /><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M12 4v6" /><path d="M2 18h20" /></>,
  narozniki: <><path d="M4 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" /><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6.5a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M10 4v8" /><path d="M4 18v2" /><path d="M20 18v2" /></>,
  stoly: <><rect x="2" y="7" width="20" height="3" rx="1" /><path d="M5 10v10" /><path d="M19 10v10" /><path d="M5 14h14" /></>,
  krzesla: <><path d="M7 11V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v7" /><rect x="5" y="11" width="14" height="3" rx="1" /><path d="M6 14v7" /><path d="M18 14v7" /><path d="M7 7h10" /></>,
}

function Home({ add }: { add: (p: Product) => void }) {
  const [tab, setTab] = useState(0)
  const tabs = ['Bestsellery', 'Nowości', 'Promocje']
  const list = tab === 2 ? products.filter(p => p.old).slice(0, 4) : tab === 1 ? [...products].reverse().slice(0, 4) : products.slice(0, 4)
  return <>
    <W className="pt-6 lg:pt-8">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-4 lg:gap-6 lg:h-[640px]">
        <div className="order-2 lg:order-1 rounded-md bg-sand flex flex-col justify-between p-7 sm:p-10 lg:p-14">
          <div className="text-[13px] font-medium text-meta">Kolekcja jesień 2026</div>
          <div className="my-10 lg:my-0">
            <h1 className="font-display text-[40px] sm:text-[56px] xl:text-[68px] leading-[1.0] tracking-[-0.04em]">Spokój,<br />który czujesz<br />w domu.</h1>
            <p className="mt-6 text-[16px] sm:text-[17px] leading-relaxed max-w-md">Sofy, fotele i łóżka projektowane we Wrocławiu. Teraz do −30% na wybrane modele.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#/kategoria/sofy" className="h-12 px-7 rounded-full bg-accent text-white text-[15px] font-medium grid place-items-center hover:bg-accent-dark transition">Zobacz kolekcję</a>
              <a href="#/kategoria/sofy" className="h-12 px-7 rounded-full border border-forest text-forest text-[15px] font-medium grid place-items-center hover:bg-forest hover:text-white transition">Promocje</a>
            </div>
          </div>
          <div className="text-[13px] text-meta">Darmowa dostawa z wniesieniem od 999 zł</div>
        </div>
        <a href="#/kategoria/sofy" className="order-1 lg:order-2 group relative rounded-md overflow-hidden min-h-[340px] sm:min-h-[460px]">
          <img src={img('living-cream')} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-[1200ms]" />
          <span className="absolute left-5 bottom-5 bg-white rounded-md px-4 py-3 text-[13.5px] shadow-sm"><span className="font-medium">Salon Cream</span> <span className="text-meta">· 12 produktów</span></span>
        </a>
      </div>
    </W>
    <Benefits />
    <Sec title="Kategorie" link="Wszystkie kategorie">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
        {mainCats.map(c => <a key={c.slug} href={`#/kategoria/${c.slug}`} className="group flex flex-col items-center rounded-lg bg-white border border-[#e5e5e5] shadow-[0_2px_10px_-4px_rgba(0,0,0,.08)] px-3 pt-6 pb-5 sm:pt-8 sm:pb-6 transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[0_18px_34px_-18px_rgba(0,0,0,.35)]">
          <span className="w-[76px] h-[76px] sm:w-[104px] sm:h-[104px] rounded-full bg-sand grid place-items-center transition duration-300 group-hover:bg-[#f4e1d6]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-14 sm:h-14 text-ink transition duration-300 group-hover:text-accent group-hover:scale-105">{catIcon[c.slug]}</svg>
          </span>
          <span className="mt-4 sm:mt-5 text-center text-[14px] sm:text-[16px] font-bold leading-tight">{c.name}</span>
          <span className="mt-0.5 text-center text-[12px] sm:text-[13px] text-meta">{c.count} produktów</span>
        </a>)}
      </div>
    </Sec>
    <Sec title="Wybrane dla Ciebie" link="Zobacz wszystkie">
      <div className="flex gap-6 -mt-4 mb-8 border-b border-line">{tabs.map((t, i) => <button key={t} onClick={() => setTab(i)} className={`pb-3 -mb-px text-[15px] font-medium border-b transition ${tab === i ? 'border-ink' : 'border-transparent text-meta hover:text-ink'}`}>{t}</button>)}</div>
      <Grid>{list.map(p => <ProductCard key={p.id} p={p} add={add} />)}</Grid>
    </Sec>
    <Reviews />
    <ShopTheLook />
    <Journal />
    <PromoPair />
    <Brand />
    <Guides />
  </>
}

const journal = [['j1', 'Materace\nSklep', 'Dobierz materac do łóżka'], ['j2', 'Biuro\nw domu', 'Biurka i krzesła do pracy'], ['j3', 'Pokój\nmłodzieżowy', 'Łóżka i biurka na lata'], ['j4', 'Stoły\ni krzesła', 'Jadalnia na wspólne kolacje'], ['j5', 'Wygodna\nsypialnia', 'Łóżka tapicerowane i dodatki'], ['j6', 'Wszystko\nsię zmieści', 'Komody i witryny z charakterem'], ['j7', 'Salon\nw bieli', 'Jasne sofy i miękkie tkaniny'], ['j8', 'Strefa\nrelaksu', 'Fotele i stoliki kawowe']]

function Journal() {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ l: true, r: false })
  const upd = () => { const e = ref.current; if (e) setEdge({ l: e.scrollLeft < 4, r: e.scrollLeft + e.clientWidth > e.scrollWidth - 4 }) }
  const go = (d: number) => { const e = ref.current; if (!e) return; const c = e.firstElementChild as HTMLElement; e.scrollBy({ left: d * (c.offsetWidth + 16) * 2, behavior: 'smooth' }) }
  const Arrow = ({ d, hide }: { d: number; hide: boolean }) => <button onClick={() => go(d)} aria-label={d < 0 ? 'Poprzednie' : 'Następne'} className={`hidden lg:grid absolute top-1/2 -translate-y-1/2 ${d < 0 ? '-left-5' : '-right-5'} z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,.12)] place-items-center hover:scale-105 transition ${hide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><I.Chevron className={`w-[18px] h-[18px] ${d < 0 ? 'rotate-180' : ''}`} /></button>
  return <Sec title="Dziennik dobrych wnętrz" link="Wszystkie inspiracje">
    <div className="relative">
      <Arrow d={-1} hide={edge.l} /><Arrow d={1} hide={edge.r} />
      <div ref={ref} onScroll={upd} className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 scroll-px-4 lg:mx-0 lg:px-0 lg:scroll-px-0">
        {journal.map(([i, t, s]) => <a key={i} href="#/kategoria/sofy" className="group relative snap-start shrink-0 w-[60%] sm:w-[36%] lg:w-[calc((100%-80px)/6)] aspect-[2/3] rounded-md overflow-hidden bg-soft">
          <img src={img(i)} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition duration-[900ms]" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/45 to-transparent" />
          <div className="absolute left-4 right-4 top-4 text-white"><div className="whitespace-pre-line text-[22px] sm:text-[24px] font-semibold leading-[1.05] tracking-[-0.03em]">{t}</div><div className="text-[13px] mt-2 opacity-95">{s}</div></div>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-4 whitespace-nowrap h-10 px-5 rounded-full bg-white text-ink text-[13.5px] font-medium grid place-items-center group-hover:-translate-y-0.5 group-hover:bg-accent group-hover:text-white transition">Poznaj produkty</span>
        </a>)}
      </div>
    </div>
  </Sec>
}

function Usp() {
  const items = [[I.Truck, 'Darmowa dostawa', 'od 999 zł, z wniesieniem'], [I.Card, 'Raty 0%', '20 rat, decyzja w 15 minut'], [I.Return, '30 dni na zwrot', 'bez podawania przyczyny'], [I.Shield, '5 lat gwarancji', 'na stelaże i konstrukcje']] as const
  return <W className="pt-20 lg:pt-28"><div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-line pt-10">
    {items.map(([Ic, t, s]) => <div key={t} className="flex gap-3.5"><Ic className="w-6 h-6 shrink-0" /><div><div className="text-[15px] font-semibold">{t}</div><div className="text-[13.5px] text-meta mt-0.5">{s}</div></div></div>)}
  </div></W>
}

function Stars({ r, n }: { r: number; n: number }) {
  return <div className="flex items-center gap-1.5 text-[13.5px]"><I.Star className="w-4 h-4" /><b className="font-semibold">{r.toFixed(1)}</b><span className="text-meta">· {n} opinii</span></div>
}

function Category({ slug, add }: { slug: string; add: (p: Product) => void }) {
  const cat = categories.find(c => c.slug === slug) ?? categories[0]
  const [sort, setSort] = useState('pop')
  const [promo, setPromo] = useState(false)
  const [fast, setFast] = useState(false)
  const [max, setMax] = useState(6000)
  const [filters, setFilters] = useState(false)
  const list = useMemo(() => {
    let l = products.filter(p => p.price <= max && (!promo || p.old) && (!fast || p.delivery === '24 h'))
    if (sort === 'asc') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'desc') l = [...l].sort((a, b) => b.price - a.price)
    if (sort === 'rating') l = [...l].sort((a, b) => b.rating - a.rating)
    return l
  }, [sort, promo, fast, max])
  const Box = ({ t, children }: { t: string; children: React.ReactNode }) => <div className="py-5 border-b border-line"><div className="text-[15px] font-semibold mb-3">{t}</div>{children}</div>
  const Chk = ({ l, n, on, set }: { l: string; n?: number; on?: boolean; set?: () => void }) => {
    const [x, sx] = useState(!!on)
    const v = set ? !!on : x
    return <label className="flex items-center gap-3 py-1.5 text-[15px] cursor-pointer group" onClick={e => { e.preventDefault(); set ? set() : sx(!x) }}>
      <span className={`w-5 h-5 rounded border-[1.5px] grid place-items-center transition ${v ? 'bg-ink border-ink text-white' : 'border-ink/40 group-hover:border-ink'}`}>{v && <I.Check className="w-3.5 h-3.5" />}</span>{l}{n !== undefined && <span className="ml-auto text-meta text-[13px]">({n})</span>}</label>
  }
  const sidebar = <>
    <Box t="Kategorie">{mainCats.map(c => <a key={c.slug} href={`#/kategoria/${c.slug}`} className={`block py-1.5 text-[15px] hover:underline ${c.slug === cat.slug ? 'font-semibold' : ''}`}>{c.name} <span className="text-meta text-[13px]">({c.count})</span></a>)}</Box>
    <Box t="Cena"><input type="range" min={200} max={6000} step={100} value={max} onChange={e => setMax(+e.target.value)} className="w-full accent-black" /><div className="flex justify-between text-[14px] mt-1"><span>200 zł</span><b>do {zl(max)}</b></div></Box>
    <Box t="Kolor"><div className="flex flex-wrap gap-2.5">{['#2f5b4c', '#c9bfb1', '#3d3d3d', '#a0663c', '#f1ece4', '#6b7a8f', '#d9a530'].map(c => <button key={c} className="w-8 h-8 rounded-full border border-ink/15 hover:ring-2 hover:ring-black ring-offset-2 transition" style={{ background: c }} />)}</div></Box>
    <Box t="Materiał">{[['Tkanina', 124], ['Boucle', 31], ['Skóra ekologiczna', 22], ['Welur', 47]].map(([l, n]) => <Chk key={l} l={l as string} n={n as number} />)}</Box>
    <Box t="Dostępność"><Chk l="Promocje" on={promo} set={() => setPromo(!promo)} /><Chk l="Wysyłka w 24 h" on={fast} set={() => setFast(!fast)} /></Box>
  </>
  return <W className="pt-5 pb-4">
    <div className="text-[13px] flex items-center gap-1.5"><a href="#/" className="hover:underline">Strona główna</a><I.Chevron className="w-3 h-3" /><span className="font-semibold">{cat.name}</span></div>
    <h1 className="font-display text-[32px] sm:text-[44px] leading-tight mt-4 tracking-[-0.035em]">{cat.name} <span className="text-[16px] font-sans font-medium text-meta align-middle">({list.length} produktów)</span></h1>
    <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">Wygodne {cat.name.toLowerCase()} do salonu i sypialni. Wybierz tkaninę, kolor i wymiar, a my dostarczymy mebel z wniesieniem gratis.</p>
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-5 pb-1">{['Narożniki', 'Sofy 3-osobowe', 'Rozkładane', 'Z funkcją spania', 'Modułowe', 'Boucle', 'Welurowe'].map(t => <a key={t} href="#/kategoria/sofy" className="shrink-0 h-10 px-5 rounded-full border border-line text-[14px] font-medium grid place-items-center hover:border-ink transition">{t}</a>)}</div>
    <div className="flex gap-10 mt-6">
      <aside className="hidden lg:block w-[260px] shrink-0 -mt-5">{sidebar}</aside>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-line">
          <button onClick={() => setFilters(true)} className="lg:hidden h-10 px-5 rounded-full border border-ink text-[14px] font-semibold">Filtry</button>
          <div className="hidden lg:flex gap-2">{promo && <span className="h-8 px-3 rounded-full bg-accent text-white text-[13px] font-semibold flex items-center gap-2">Promocje <button onClick={() => setPromo(false)}>×</button></span>}{fast && <span className="h-8 px-3 rounded-full bg-accent text-white text-[13px] font-semibold flex items-center gap-2">Wysyłka 24 h <button onClick={() => setFast(false)}>×</button></span>}<span className="text-[14px] self-center">{list.length} produktów</span></div>
          <label className="flex items-center gap-2 text-[14px]"><span className="hidden sm:inline font-semibold">Sortuj:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} className="h-10 rounded-full border border-ink px-4 bg-white outline-none cursor-pointer font-medium">
              <option value="pop">Polecane</option><option value="asc">Cena: od najniższej</option><option value="desc">Cena: od najwyższej</option><option value="rating">Najlepiej oceniane</option></select></label>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-5 gap-y-8">{list.map(p => <ProductCard key={p.id} p={p} add={add} />)}</div>
        {!list.length && <div className="py-20 text-center">Brak produktów dla wybranych filtrów.</div>}
      </div>
    </div>
    {filters && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-ink/40" onClick={() => setFilters(false)} />
      <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white p-6 overflow-y-auto fade-up"><div className="flex justify-between items-center"><span className="font-display text-2xl">Filtry</span><button onClick={() => setFilters(false)} className="text-sm font-semibold underline">Zamknij</button></div>{sidebar}
        <Btn onClick={() => setFilters(false)} className="mt-6 w-full">Pokaż {list.length} produktów</Btn></div></div>}
  </W>
}

function ProductPage({ id, add }: { id: string; add: (p: Product) => void }) {
  const p = products.find(x => x.id === id) ?? products[0]
  const gallery = [p.img, p.img2, 'living-bright', 'living-orange']
  const [g, setG] = useState(0)
  const [c, setC] = useState(0)
  const [size, setSize] = useState(1)
  const [qty, setQty] = useState(1)
  const [liked, setLiked] = useState(false)
  const colorNames = ['Butelkowa zieleń', 'Beż', 'Grafit', 'Koniak']
  const cat = categories.find(x => x.slug === p.cat)!
  const disc = p.badge?.startsWith('-')
  return <W className="pt-5">
    <div className="text-[13px] flex items-center gap-1.5"><a href="#/" className="hover:underline">Strona główna</a><I.Chevron className="w-3 h-3" /><a href={`#/kategoria/${cat.slug}`} className="hover:underline">{cat.name}</a><I.Chevron className="w-3 h-3" /><span className="font-semibold">{p.name}</span></div>
    <div className="grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_500px] gap-8 lg:gap-12 mt-5">
      <div>
        <div className="lg:hidden relative aspect-square rounded-md overflow-hidden bg-soft"><img key={g} src={img(gallery[g])} alt={p.name} className="w-full h-full object-cover fade-up" /></div>
        <div className="lg:hidden flex gap-2 mt-3">{gallery.map((x, i) => <button key={i} onClick={() => setG(i)} className={`w-16 h-16 rounded-md overflow-hidden ${g === i ? 'ring-2 ring-black' : 'opacity-70'}`}><img src={img(x)} alt="" className="w-full h-full object-cover" /></button>)}</div>
        <div className="hidden lg:grid grid-cols-2 gap-3">{gallery.map((x, i) => <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-soft group">
          <img src={img(x)} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700" />
          {i === 0 && p.badge && <span className={`absolute top-3 left-3 rounded-full px-3 h-7 grid place-items-center text-[14px] font-semibold bg-white`}>{disc ? 'Promocja' : p.badge}</span>}</div>)}</div>
      </div>
      <div className="lg:sticky lg:top-[230px] self-start">
        <div className="text-[13px] font-medium text-meta">Sklep Design</div>
        <h1 className="font-display text-[28px] sm:text-[36px] leading-[1.1] mt-1.5 tracking-[-0.03em]">{p.name}</h1><p className="mt-1.5 text-[15px]">{descs[p.cat]}</p>
        <div className="mt-2.5 flex items-center gap-4"><Stars r={p.rating} n={p.reviews} /><span className="text-[13px] text-meta">Kod: WH-{p.id.length}0{p.price}</span></div>
        <div className="mt-5 flex items-baseline gap-3"><span className={`text-[28px] font-semibold leading-none`}>{zl(p.price * qty)}</span>{p.old && <span className="text-[16px] line-through">{zl(p.old * qty)}</span>}</div>
        {p.old && <div className="text-[12px] text-meta mt-1.5">Najniższa cena z 30 dni przed obniżką {zl(Math.round(p.old * 0.95))}</div>}
        <div className="mt-3 rounded-md bg-soft px-4 py-3 text-[14px] flex items-center gap-3"><I.Card className="w-5 h-5" /><span><b>{zl(Math.ceil(p.price / 20))}</b> x 20 rat 0% · <a className="underline font-semibold cursor-pointer">Oblicz ratę</a></span></div>
        <div className="mt-6"><div className="text-[15px] mb-2.5">Kolor: <b>{colorNames[c]}</b></div>
          <div className="flex gap-2.5">{p.colors.map((col, i) => <button key={col} onClick={() => setC(i)} className={`w-12 h-12 rounded-full border border-ink/15 ring-offset-[3px] transition ${c === i ? 'ring-2 ring-black' : 'hover:ring-1 hover:ring-black/40'}`} style={{ background: col }} />)}</div></div>
        <div className="mt-5"><div className="text-[15px] mb-2.5">Wariant: <b>{['2-osobowa', '3-osobowa', 'Narożnik'][size]}</b></div>
          <div className="grid grid-cols-3 gap-2">{['2-osobowa', '3-osobowa', 'Narożnik'].map((s, i) => <button key={s} onClick={() => setSize(i)} className={`h-12 rounded-md border-[1.5px] text-[14px] font-semibold transition ${size === i ? 'border-ink' : 'border-line hover:border-ink/50'}`}>{s}</button>)}</div></div>
        <div className="flex gap-2.5 mt-6">
          <div className="flex items-center h-[50px] rounded-full border border-ink"><button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-full text-lg">−</button><span className="w-5 text-center font-semibold">{qty}</span><button onClick={() => setQty(qty + 1)} className="w-11 h-full text-lg">+</button></div>
          <Btn onClick={() => add(p)} className="flex-1"><I.Bag className="w-5 h-5" />Dodaj do koszyka</Btn>
          <button onClick={() => setLiked(!liked)} className="w-[50px] h-[50px] rounded-full border border-ink grid place-items-center hover:bg-soft transition"><I.Heart className={`w-5 h-5 ${liked ? 'fill-accent text-accent' : ''}`} /></button>
        </div>
        <div className="mt-6 divide-y divide-line border-y border-line text-[14.5px]">
          <div className="flex gap-3 py-3.5"><I.Truck className="w-5 h-5 shrink-0" /><div><b>Wysyłka w {p.delivery}</b><div className="text-meta text-[13.5px]">Darmowa dostawa z wniesieniem</div></div></div>
          <div className="flex gap-3 py-3.5"><I.Return className="w-5 h-5 shrink-0" /><div><b>30 dni na zwrot</b><div className="text-meta text-[13.5px]">Bez podawania przyczyny</div></div></div>
          <div className="flex gap-3 py-3.5"><I.Shield className="w-5 h-5 shrink-0" /><div><b>5 lat gwarancji</b><div className="text-meta text-[13.5px]">Wymiary: {p.dims}</div></div></div>
        </div>
        <div className="divide-y divide-line border-b border-line">{['Opis produktu', 'Wymiary i materiały', `Opinie (${p.reviews})`].map(t => <details key={t} className="group py-4"><summary className="flex justify-between cursor-pointer list-none text-[15px] font-semibold">{t}<span className="group-open:rotate-45 transition text-xl leading-none">+</span></summary><p className="text-[14px] mt-3 leading-relaxed">Tkanina o odporności 50 000 cykli Martindale, stelaż z drewna bukowego, sprężyny falbanki. Wymiary: {p.dims}.</p></details>)}</div>
      </div>
    </div>
    <div className="pt-20 lg:pt-28"><h2 className="font-display text-[26px] sm:text-[34px] mb-8">Klienci kupili także</h2>
      <Grid>{products.filter(x => x.id !== p.id).slice(2, 6).map(x => <ProductCard key={x.id} p={x} add={add} />)}</Grid></div>
  </W>
}

function Footer() {
  const [done, setDone] = useState(false)
  const cols = [['Sklep', ['Salon', 'Sypialnia', 'Jadalnia', 'Oświetlenie', 'Promocje']], ['Pomoc', ['Dostawa i wniesienie', 'Raty 0%', 'Zwroty i reklamacje', 'Status zamówienia', 'FAQ']], ['Sklep', ['O nas', 'Sklep Design', 'Dla architektów', 'Kariera', 'Regulamin']]] as const
  return <footer id="foot" className="mt-20 lg:mt-28 bg-forest text-white text-[14.5px]">
    <div className="relative overflow-hidden bg-forest-2">
      <img src={img('living-orange')} alt="" className="hidden lg:block absolute right-0 top-0 h-full w-[38%] object-cover" />
      <div className="hidden lg:block absolute right-0 top-0 h-full w-[38%] bg-gradient-to-r from-forest-2 via-forest-2/40 to-transparent" />
      <W className="relative py-14 lg:py-20">
        <div className="max-w-[720px]">
          <span className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-accent text-white text-[13px] font-semibold">−10% na start</span>
          <h3 className="mt-5 font-display text-[34px] sm:text-[48px] xl:text-[56px] leading-[1.02] tracking-[-0.04em]">Dołącz do nas i zgarnij −10% na pierwsze zakupy</h3>
          <p className="mt-4 text-[16px] text-white/80 max-w-lg">Raz w tygodniu: nowe kolekcje, inspiracje i promocje tylko dla subskrybentów. Bez spamu.</p>
          {done ? <div className="mt-8 h-14 inline-flex items-center gap-3 px-6 rounded-full bg-white text-forest font-semibold fade-up"><I.Check className="w-5 h-5" />Gotowe! Kod −10% jest już w Twojej skrzynce.</div> :
            <form onSubmit={e => { e.preventDefault(); setDone(true) }} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-[600px]">
              <input required type="email" placeholder="Twój adres e-mail" className="w-full sm:flex-1 h-14 shrink-0 rounded-full px-6 bg-white text-ink text-[16px] outline-none placeholder:text-meta focus:ring-4 focus:ring-accent/40" />
              <button className="h-14 px-8 rounded-full bg-accent text-white text-[16px] font-semibold hover:bg-accent-dark transition">Odbierz rabat</button></form>}
          <div className="mt-3 text-[12.5px] text-white/60">Zapisując się, akceptujesz politykę prywatności. Wypiszesz się jednym kliknięciem.</div>
        </div>
      </W>
    </div>
    <W className="py-8 grid sm:grid-cols-3 gap-6 border-b border-white/15">
      {[[I.Phone, '71 123 45 67', 'pon–pt 8–18, sob 9–14'], [I.Card, 'kontakt@sklep.pl', 'Odpowiadamy w ciągu 2 godzin'], [I.User, 'Czat na żywo', 'Codziennie 8–22']].map(([Ic, t, s]: any) => <div key={t} className="flex items-center gap-4">
        <span className="w-12 h-12 rounded-full bg-white/10 grid place-items-center shrink-0"><Ic className="w-5 h-5" /></span><div><div className="text-[16px] font-semibold">{t}</div><div className="text-[13px] text-white/70">{s}</div></div></div>)}
    </W>
    <W className="py-12 lg:py-14 grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
      <div className="col-span-2 lg:col-span-1 max-w-sm">
        <div className="text-[28px] font-semibold tracking-[-0.04em] leading-none">sklep</div>
        <p className="mt-3 text-white/70">Meble projektowane we Wrocławiu i produkowane w Polsce. Dostarczamy z wniesieniem w całym kraju.</p>
        <div className="flex gap-2.5 mt-5">{['IG', 'FB', 'PIN', 'YT', 'TT'].map(x => <a key={x} className="w-10 h-10 rounded-full border border-white/25 grid place-items-center text-[11.5px] font-semibold hover:bg-white hover:text-forest transition cursor-pointer">{x}</a>)}</div>
      </div>
      {cols.map(([t, l]) => <div key={t}><div className="font-semibold mb-4">{t}</div><ul className="space-y-2.5 text-white/70">{l.map(x => <li key={x}><a className="ulink hover:text-white cursor-pointer">{x}</a></li>)}</ul></div>)}
    </W>
    <W className="py-6 border-t border-white/15 flex flex-col lg:flex-row gap-4 lg:items-center justify-between text-[12.5px]">
      <div className="flex flex-wrap items-center gap-2"><span className="text-white/60 mr-1">Płatności:</span>{['BLIK', 'Visa', 'Mastercard', 'Przelewy24', 'PayPo', 'Raty 0%'].map(x => <span key={x} className="rounded bg-white text-forest px-2 py-1 font-semibold">{x}</span>)}</div>
      <div className="flex flex-wrap items-center gap-2"><span className="text-white/60 mr-1">Dostawa:</span>{['Kurier z wniesieniem', 'DPD', 'InPost'].map(x => <span key={x} className="rounded border border-white/25 px-2 py-1 font-semibold">{x}</span>)}</div>
      <span className="text-white/60">© 2026 Sklep</span>
    </W>
  </footer>
}
