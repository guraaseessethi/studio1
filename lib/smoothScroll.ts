let frame = 0;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Scroll the element with this id to the top of the viewport. */
export function scrollToId(id: string, { updateHash = true } = {}): void {
  const el = document.getElementById(id);
  if (!el) return;

  const start = window.scrollY;
  const target = Math.max(0, start + el.getBoundingClientRect().top);
  const distance = target - start;

  const finish = () => {
    if (updateHash) history.replaceState(null, "", `#${id}`);
    if (el.tabIndex === -1) el.focus({ preventScroll: true });
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || Math.abs(distance) < 2) {
    window.scrollTo(0, target);
    finish();
    return;
  }

  const duration = Math.min(950, Math.max(520, Math.abs(distance) * 0.35));
  let t0: number | null = null;
  cancelAnimationFrame(frame);
  const step = (now: number) => {
    if (t0 === null) t0 = now;
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, start + distance * easeInOutCubic(p));
    if (p < 1) frame = requestAnimationFrame(step);
    else finish();
  };
  frame = requestAnimationFrame(step);
}
