// Shared-element hand-off: the work stage records where the project title was,
// and the case-study page grows a copy of it from there into its own heading.
export const morph: { from: null | { rect: DOMRect; fontSize: number; text: string; at: number } } = { from: null };

export function captureTitle(el: HTMLElement | null) {
  if (!el) return;
  morph.from = { rect: el.getBoundingClientRect(), fontSize: parseFloat(getComputedStyle(el).fontSize), text: el.textContent || '', at: performance.now() };
}
