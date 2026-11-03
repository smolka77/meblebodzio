type P = { className?: string };
const S = ({ d, className = "w-5 h-5" }: { d: string } & P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
export const Search = (p: P) => <S {...p} d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3" />;
export const User = (p: P) => <S {...p} d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />;
export const Heart = (p: P) => <S {...p} d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6Z" />;
export const Bag = (p: P) => <S {...p} d="M6 7h12l1 14H5L6 7Zm3 0V5a3 3 0 0 1 6 0v2" />;
export const Truck = (p: P) => <S {...p} d="M3 6h11v10H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />;
export const Card = (p: P) => <S {...p} d="M3 6h18v12H3zM3 10h18M7 15h3" />;
export const Return = (p: P) => <S {...p} d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />;
export const Shield = (p: P) => <S {...p} d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4" />;
export const Phone = (p: P) => <S {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />;
export const Menu = (p: P) => <S {...p} d="M4 7h16M4 12h16M4 17h16" />;
export const Chevron = (p: P) => <S {...p} d="m9 6 6 6-6 6" />;
export const Star = ({ className = "w-3.5 h-3.5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);
export const Check = (p: P) => <S {...p} d="m5 12 5 5 9-10" />;
export const Arrow = (p: P) => <S {...p} d="M5 12h14m-6-6 6 6-6 6" />;
export const Flag = (p: P) => <S {...p} d="M5 21V4m0 0h13l-2.5 4L18 12H5" />;
export const Pencil = (p: P) => <S {...p} d="m4 20 1-4L16 5l3 3L8 19l-4 1Zm9-13 3 3" />;
export const Factory = (p: P) => <S {...p} d="M3 21V10l6 3v-3l6 3V5h6v16H3Zm4-4h2m3 0h2m3 0h2" />;
export const Grid = (p: P) => <S {...p} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />;
export const Sparkle = (p: P) => <S {...p} d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 11 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />;
export const Ruler = (p: P) => <S {...p} d="M3 17 17 3l4 4L7 21l-4-4Zm5-5 2 2m1-5 2 2m1-5 2 2" />;
export const Camera = (p: P) => <S {...p} d="M4 8h3l2-3h6l2 3h3v11H4V8Zm8 8.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />;
export const Close = (p: P) => <S {...p} d="M6 6l12 12M18 6 6 18" />;
export const Plus = (p: P) => <S {...p} d="M12 5v14M5 12h14" />;
export const Minus = (p: P) => <S {...p} d="M5 12h14" />;
export const Sliders = (p: P) => <S {...p} d="M4 7h9m4 0h3M4 17h3m4 0h9M15 5v4M9 15v4" />;
export const Play = (p: P) => <S {...p} d="M8 5v14l11-7L8 5Z" />;
export const Box = (p: P) => <S {...p} d="m3 7 9-4 9 4v10l-9 4-9-4V7Zm9 4 9-4M12 11v10M12 11 3 7" />;
export const ArrowLeft = (p: P) => <S {...p} d="M19 12H5m6-6-6 6 6 6" />;
export const Lock = (p: P) => <S {...p} d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" />;
export const Home = (p: P) => <S {...p} d="m3 11 9-8 9 8M5 10v10h14V10" />;
export const Expand = (p: P) => <S {...p} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />;
export const Rotate = (p: P) => <S {...p} d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />;
export const Upload = (p: P) => <S {...p} d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v4h16v-4" />;
