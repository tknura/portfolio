import { buildGraph, icons, initialSelection, palette } from '../data/graph';
import { GraphPhysics, type PhysicsNode } from './graph-physics';
import { byId } from './dom';
import { reducedMotion } from './reduced-motion';

const NS = 'http://www.w3.org/2000/svg';

type RenderNode = PhysicsNode & { el: SVGGElement };

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
  parent: Element,
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent.appendChild(e);
  return e;
}

export function initExplorerGraph() {
  const svg = byId<HTMLElement>('explorer-graph') as unknown as SVGSVGElement;
  const world = byId('explorer-world') as unknown as SVGGElement;
  const edgesLayer = byId('explorer-edges') as unknown as SVGGElement;
  const nodesLayer = byId('explorer-nodes') as unknown as SVGGElement;
  const selectedLabel = byId('explorer-selected');
  const detailLabel = byId('explorer-detail');
  const zoomIn = byId<HTMLButtonElement>('explorer-in');
  const zoomOut = byId<HTMLButtonElement>('explorer-out');

  const { nodes: baseNodes, links } = buildGraph();
  const nodes = baseNodes.map((n) => ({
    ...n,
    vx: 0,
    vy: 0,
    homeX: n.x,
    homeY: n.y,
    fx: null,
    fy: null,
  })) as RenderNode[];
  const map = new Map(nodes.map((n) => [n.id, n]));
  const initial = nodes.map((n) => [n.x, n.y] as const);

  let selected = initialSelection;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let width = 1000;
  let height = 520;
  let drag: { id: number; node: RenderNode | null; x: number; y: number } | null = null;
  let frame = 0;
  let physicsFrame = 0;
  let visible = false;
  let graphActive = true;

  const physics = new GraphPhysics(nodes, links);
  physics.settle(95);

  function animate() {
    physicsFrame = 0;
    if (!visible || !graphActive || document.hidden) return;
    const moving = physics.tick();
    render();
    if (moving || drag?.node) physicsFrame = requestAnimationFrame(animate);
  }
  function wake() {
    physics.reheat();
    if (reducedMotion.matches) {
      physics.settle(180);
      render();
      return;
    }
    if (visible && graphActive && !document.hidden && !physicsFrame) physicsFrame = requestAnimationFrame(animate);
  }
  function stop() {
    if (physicsFrame) cancelAnimationFrame(physicsFrame);
    physicsFrame = 0;
  }

  const edges = links.map(([a, b]) => {
    const p = el('path', { class: 'explorer-edge' }, edgesLayer);
    p.dataset.from = a;
    p.dataset.to = b;
    return p;
  });

  for (const n of nodes) {
    const g = el(
      'g',
      {
        class: 'explorer-node',
        role: 'button',
        tabindex: '0',
        'aria-label': `${n.name}. ${n.kind}. Enter to select; arrow keys to move.`,
        'aria-pressed': 'false',
      },
      nodesLayer,
    );
    g.dataset.node = n.id;
    n.el = g;
    el('circle', { r: String(n.r + 7), class: 'explorer-hit' }, g);
    el('circle', { r: String(n.r), fill: palette[n.kind], class: 'explorer-dot' }, g);
    const icon = icons[n.kind];
    if (icon) {
      el(
        'path',
        {
          d: icon,
          fill: 'none',
          stroke: '#fff',
          'stroke-width': '1.4',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
        g,
      );
    }
    el('title', {}, g).textContent = n.name;

    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(n.id);
        return;
      }
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-10, 0],
        ArrowRight: [10, 0],
        ArrowUp: [0, -10],
        ArrowDown: [0, 10],
      };
      const d = delta[e.key];
      if (!d) return;
      e.preventDefault();
      n.x += d[0];
      n.y += d[1];
      n.fx = n.x;
      n.fy = n.y;
      wake();
      n.fx = n.fy = null;
      render();
    });
    g.addEventListener('click', (e) => {
      if (e.detail === 0) select(n.id);
    });
  }

  function select(id: string) {
    selected = id;
    const n = map.get(id)!;
    const near = links.filter((l) => l.includes(id)).map((l) => (l[0] === id ? l[1] : l[0]));
    selectedLabel.textContent = n.name;
    detailLabel.textContent = `${n.kind.toUpperCase()} · ${near.length} connection${near.length === 1 ? '' : 's'}`;
    for (const node of nodes) {
      node.el.classList.toggle('selected', node.id === id);
      node.el.classList.toggle('neighbor', near.includes(node.id));
      node.el.classList.toggle('distant', node.id !== id && !near.includes(node.id));
      node.el.setAttribute('aria-pressed', String(node.id === id));
    }
    for (const p of edges) p.classList.toggle('active', p.dataset.from === id || p.dataset.to === id);
  }

  function render() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      world.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
      for (const n of nodes) n.el.setAttribute('transform', `translate(${n.x} ${n.y})`);
      for (const p of edges) {
        const a = map.get(p.dataset.from!)!;
        const b = map.get(p.dataset.to!)!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const ax = a.x + (dx / d) * (a.r + 2);
        const ay = a.y + (dy / d) * (a.r + 2);
        const bx = b.x - (dx / d) * (b.r + 2);
        const by = b.y - (dy / d) * (b.r + 2);
        p.setAttribute('d', `M ${ax} ${ay} Q ${(ax + bx) / 2 - dy * 0.055} ${(ay + by) / 2 + dx * 0.055} ${bx} ${by}`);
      }
      zoomIn.disabled = scale >= 2.5;
      zoomOut.disabled = scale <= 0.25;
    });
  }

  function fit() {
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 30;
    const maxX = Math.max(...xs) + 30;
    const minY = Math.min(...ys) - 30;
    const maxY = Math.max(...ys) + 30;
    scale = Math.max(0.25, Math.min(1.5, width / (maxX - minX), height / (maxY - minY)));
    tx = (width - (maxX + minX) * scale) / 2;
    ty = (height - (maxY + minY) * scale) / 2;
    render();
  }

  function zoom(f: number) {
    const next = Math.max(0.25, Math.min(2.5, scale * f));
    const r = next / scale;
    tx = width / 2 - (width / 2 - tx) * r;
    ty = height / 2 - (height / 2 - ty) * r;
    scale = next;
    render();
  }

  function resize() {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    width = r.width;
    height = r.height;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    fit();
  }

  zoomIn.addEventListener('click', () => zoom(1.25));
  zoomOut.addEventListener('click', () => zoom(0.8));
  byId('explorer-fit').addEventListener('click', fit);
  byId('explorer-reset').addEventListener('click', () => {
    nodes.forEach((n, i) => {
      [n.x, n.y] = initial[i]!;
      n.vx = n.vy = 0;
      n.fx = n.fy = null;
    });
    physics.reheat(1);
    physics.settle(95);
    select(initialSelection);
    fit();
    wake();
  });

  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || drag) return;
    const g = (e.target as Element).closest<SVGGElement>('[data-node]');
    drag = { id: e.pointerId, node: g ? map.get(g.dataset.node!)! : null, x: e.clientX, y: e.clientY };
    svg.setPointerCapture(e.pointerId);
    if (g && drag.node) {
      drag.node.fx = drag.node.x;
      drag.node.fy = drag.node.y;
      wake();
      select(g.dataset.node!);
      g.focus({ preventScroll: true });
    }
    svg.classList.add('dragging');
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (drag.node) {
      drag.node.x += dx / scale;
      drag.node.y += dy / scale;
      drag.node.fx = drag.node.x;
      drag.node.fy = drag.node.y;
      wake();
    } else {
      tx += dx;
      ty += dy;
    }
    render();
  });
  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.node) {
      drag.node.fx = drag.node.fy = null;
      wake();
    }
    drag = null;
    svg.classList.remove('dragging');
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) svg.addEventListener(type, endDrag);

  const tabs = [byId<HTMLButtonElement>('explorer-tab'), byId<HTMLButtonElement>('overview-tab')];
  function activate(index: number) {
    graphActive = index === 0;
    if (graphActive) wake();
    else stop();
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      byId(tab.getAttribute('aria-controls')!).hidden = i !== index;
    });
    if (index === 0) resize();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
    tab.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - i;
      activate(index);
      tabs[index]!.focus();
    });
  });

  new ResizeObserver(resize).observe(svg);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0]!.isIntersecting;
      if (visible) wake();
      else stop();
    },
    { threshold: 0.1 },
  ).observe(svg);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else wake();
  });
  reducedMotion.addEventListener('change', () => {
    stop();
    wake();
  });

  select(selected);
  render();
}
