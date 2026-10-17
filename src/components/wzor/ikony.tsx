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
