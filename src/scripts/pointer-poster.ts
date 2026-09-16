import { byId, query } from './dom';

export function initPointerPoster() {
  const surface = byId('pointer-surface');
  const coordinates = query<HTMLElement>('.pointer-coordinates', surface);
  let x = 0;
  let y = 0;
  let frame = 0;

  function paint() {
    frame = 0;
    const s = surface.style;
    s.setProperty('--px', `${(x + 1) * 50}%`);
    s.setProperty('--py', `${(y + 1) * 50}%`);
    s.setProperty('--rx', `${-y * 18}deg`);
    s.setProperty('--ry', `${x * 23}deg`);
    s.setProperty('--tx', `${x * 8}px`);
    s.setProperty('--ty', `${y * 6}px`);
    s.setProperty('--inkshift', `${x * 6}px`);
    const fmt = (v: number) => String(Math.round((v + 1) * 50)).padStart(3, '0');
    coordinates.textContent = `X ${fmt(x)} / Y ${fmt(y)}`;
  }
  function update(nx: number, ny: number) {
    x = Math.max(-1, Math.min(1, nx));
    y = Math.max(-1, Math.min(1, ny));
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function move(e: PointerEvent) {
    const r = surface.getBoundingClientRect();
    update(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  }
  const recenter = () => update(0, 0);

  surface.addEventListener('pointermove', move);
  surface.addEventListener('pointerdown', move);
  surface.addEventListener('pointerleave', recenter);
  surface.addEventListener('pointercancel', recenter);
  surface.addEventListener('blur', recenter);
  surface.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') return recenter();
    update(
      x + (e.key === 'ArrowRight' ? 0.2 : e.key === 'ArrowLeft' ? -0.2 : 0),
      y + (e.key === 'ArrowDown' ? 0.2 : e.key === 'ArrowUp' ? -0.2 : 0),
    );
  });
  byId('pointer-reset').addEventListener('click', recenter);
}
