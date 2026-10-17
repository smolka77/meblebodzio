/** Locks page scroll while a modal/overlay is open (incl. iOS). Returns unlock fn. */
export function lockPageScroll(): () => void {
  const scrollY = window.scrollY;
  const body = document.body;
  const html = document.documentElement;

  const prev = {
    bodyOverflow: body.style.overflow,
    htmlOverflow: html.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
  };

  const scrollbarWidth = window.innerWidth - html.clientWidth;

  body.style.overflow = "hidden";
  html.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    body.style.overflow = prev.bodyOverflow;
    html.style.overflow = prev.htmlOverflow;
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.left = prev.bodyLeft;
    body.style.right = prev.bodyRight;
    body.style.width = prev.bodyWidth;
    body.style.paddingRight = prev.bodyPaddingRight;
    window.scrollTo(0, scrollY);
  };
}
