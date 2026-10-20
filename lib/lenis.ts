import type Lenis from 'lenis';

// The page-wide smooth-scroll instance, if one is running.
export const lenisRef: { current: Lenis | null } = { current: null };

export function scrollToY(y: number, immediate = false) {
  const l = lenisRef.current;
  if (l) l.scrollTo(y, { immediate, duration: immediate ? 0 : 1.3 });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

export function scrollToEl(el: Element, offset = 0) {
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  scrollToY(y);
}
