import { chart, scoreTrend, trendPoints } from '../data/overview';
import { byId } from './dom';

export function initTrendChart() {
  const svg = byId('trend-chart') as unknown as SVGSVGElement;
  const crosshair = byId('trend-crosshair') as unknown as SVGLineElement;
  const hover = byId('trend-hover') as unknown as SVGCircleElement;
  const tooltip = byId('trend-tooltip');
  const tipValue = byId('trend-tip-value');
  const tipDay = byId('trend-tip-day');
  const wrap = svg.parentElement!;
  const points = trendPoints(scoreTrend);

  function show(index: number) {
    const p = points[index]!;
    crosshair.setAttribute('x1', String(p.x));
    crosshair.setAttribute('x2', String(p.x));
    hover.setAttribute('cx', String(p.x));
    hover.setAttribute('cy', String(p.y));
    crosshair.classList.remove('is-hidden');
    hover.classList.remove('is-hidden');
    tooltip.hidden = false;
    tipValue.textContent = `${p.value}%`;
    tipDay.textContent = p.day === 0 ? 'today' : `${p.day} day${p.day === 1 ? '' : 's'} ago`;
    const rect = wrap.getBoundingClientRect();
    const left = (p.x / chart.width) * rect.width;
    tooltip.style.left = `${Math.min(Math.max(left, 44), rect.width - 44)}px`;
  }
  function hide() {
    crosshair.classList.add('is-hidden');
    hover.classList.add('is-hidden');
    tooltip.hidden = true;
  }

  svg.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chart.width;
    let nearest = 0;
    let best = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    show(nearest);
  });
  svg.addEventListener('pointerleave', hide);

  svg.tabIndex = 0;
  let focused = points.length - 1;
  svg.addEventListener('focus', () => show(focused));
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    focused = Math.max(0, Math.min(points.length - 1, focused + (e.key === 'ArrowRight' ? 1 : -1)));
    show(focused);
  });
}
