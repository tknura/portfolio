import { byId } from './dom';
import { reducedMotion } from './reduced-motion';

type Vec3 = [number, number, number];

const unit = (v: Vec3): Vec3 => {
  const l = Math.hypot(...v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const point = (t: number): Vec3 => [
  (1 + 0.36 * Math.cos(3 * t)) * Math.cos(2 * t),
  0.55 * Math.sin(3 * t),
  (1 + 0.36 * Math.cos(3 * t)) * Math.sin(2 * t),
];

function buildMesh(rings: number, sides: number) {
  const vertices: Vec3[] = [];
  const normals: Vec3[] = [];
  const faces: number[][] = [];
  for (let i = 0; i < rings; i++) {
    const t = (i / rings) * Math.PI * 2;
    const c = point(t);
    const d = point(t + 0.001);
    const tangent = unit([d[0] - c[0], d[1] - c[1], d[2] - c[2]]);
    const n = unit(cross(tangent, [0, 1, 0]));
    const b = unit(cross(tangent, n));
    for (let j = 0; j < sides; j++) {
      const v = (j / sides) * Math.PI * 2;
      const normal: Vec3 = [
        n[0] * Math.cos(v) + b[0] * Math.sin(v),
        n[1] * Math.cos(v) + b[1] * Math.sin(v),
        n[2] * Math.cos(v) + b[2] * Math.sin(v),
      ];
      normals.push(normal);
      vertices.push([c[0] + 0.19 * normal[0], c[1] + 0.19 * normal[1], c[2] + 0.19 * normal[2]]);
      const a = i * sides + j;
      const next = ((i + 1) % rings) * sides;
      faces.push([a, i * sides + ((j + 1) % sides), next + ((j + 1) % sides), next + j]);
    }
  }
  return { vertices, normals, faces };
}

export function initOrbitKnot() {
  const canvas = byId<HTMLCanvasElement>('orbit-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const turnButton = byId<HTMLButtonElement>('orbit-turn');
  const pauseButton = byId<HTMLButtonElement>('orbit-pause');

  let pitch = 0.55;
  let yaw = 0.4;
  let activePointer: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let frame = 0;
  let lastTime = 0;
  let visible = false;
  let paused = reducedMotion.matches;
  let wire = false;

  const { vertices, normals, faces } = buildMesh(100, 12);

  function draw(time: number) {
    frame = 0;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dt = Math.min((time - lastTime) / 1000 || 0, 0.04);
    lastTime = time;
    if (!paused && !reducedMotion.matches && activePointer === null) yaw += dt * 0.3;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);

    const glow = ctx!.createRadialGradient(w * 0.5, h * 0.52, 0, w * 0.5, h * 0.52, Math.min(w, h) * 0.52);
    glow.addColorStop(0, '#2450e620');
    glow.addColorStop(1, '#2450e600');
    ctx!.fillStyle = glow;
    ctx!.fillRect(0, 0, w, h);

    const scale = Math.min(w * 0.29, h * 0.38);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cx = Math.cos(pitch);
    const sx = Math.sin(pitch);
    const rotate = ([x, y, z]: Vec3): Vec3 => {
      const xx = x * cy + z * sy;
      const zz = -x * sy + z * cy;
      return [xx, y * cx - zz * sx, y * sx + zz * cx];
    };
    const rotated = vertices.map(rotate);
    const rn = normals.map(rotate);
    const points = rotated.map(([x, y, z]) => {
      const p = 5 / (5 + z);
      return [w / 2 + x * scale * p, h / 2 + y * scale * p, z] as Vec3;
    });

    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      ctx!.fillStyle = i % 4 === 0 ? '#e3e7e975' : '#e3e7e924';
      ctx!.beginPath();
      ctx!.arc(
        w / 2 + Math.cos(t) * Math.min(w * 0.43, h * 0.53),
        h / 2 + Math.sin(t) * h * 0.43,
        i % 4 === 0 ? 1.5 : 0.7,
        0,
        Math.PI * 2,
      );
      ctx!.fill();
    }

    const ordered = faces
      .map((f) => ({ f, z: f.reduce((z, i) => z + points[i]![2], 0) / 4 }))
      .sort((a, b) => b.z - a.z);

    for (const { f, z } of ordered) {
      ctx!.beginPath();
      f.forEach((i, k) => {
        const p = points[i]!;
        if (k) ctx!.lineTo(p[0], p[1]);
        else ctx!.moveTo(p[0], p[1]);
      });
      ctx!.closePath();
      const normal = unit(f.reduce<Vec3>((v, i) => [v[0] + rn[i]![0], v[1] + rn[i]![1], v[2] + rn[i]![2]], [0, 0, 0]));
      const diffuse = Math.max(0, -normal[0] * 0.35 - normal[1] * 0.55 - normal[2] * 0.76);
      const shine = Math.pow(Math.max(0, -normal[1] * 0.25 - normal[2] * 0.96), 18);
      const light = 13 + diffuse * 43 + shine * 35;
      if (!wire) {
        ctx!.fillStyle = `hsl(${224 - shine * 15} ${82 - shine * 60}% ${light}%)`;
        ctx!.fill();
        ctx!.strokeStyle = `hsl(224 78% ${light}%)`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      } else {
        ctx!.strokeStyle = `rgba(104,160,255,${Math.max(0.1, 0.72 - (z + 1.6) * 0.15)})`;
        ctx!.lineWidth = 0.7;
        ctx!.stroke();
      }
    }

    if (visible && !document.hidden && !paused && !reducedMotion.matches) frame = requestAnimationFrame(draw);
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function reset() {
    pitch = 0.55;
    yaw = 0.4;
    schedule();
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || activePointer !== null) return;
    activePointer = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activePointer) return;
    yaw += (e.clientX - lastX) * 0.009;
    pitch += (e.clientY - lastY) * 0.009;
    lastX = e.clientX;
    lastY = e.clientY;
    schedule();
  });
  const finish = (e: PointerEvent) => {
    if (e.pointerId === activePointer) activePointer = null;
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const)
    canvas.addEventListener(type, finish);

  canvas.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') return reset();
    yaw += e.key === 'ArrowRight' ? 0.18 : e.key === 'ArrowLeft' ? -0.18 : 0;
    pitch += e.key === 'ArrowDown' ? 0.18 : e.key === 'ArrowUp' ? -0.18 : 0;
    schedule();
  });

  turnButton.addEventListener('click', () => {
    wire = !wire;
    turnButton.setAttribute('aria-pressed', String(wire));
    turnButton.textContent = wire ? 'Solid' : 'Wireframe';
    schedule();
  });

  function pauseLabel() {
    pauseButton.disabled = reducedMotion.matches;
    pauseButton.textContent = reducedMotion.matches ? 'Still' : paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(paused));
  }
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseLabel();
    schedule();
  });
  pauseLabel();

  byId('orbit-reset').addEventListener('click', reset);
  new ResizeObserver(schedule).observe(canvas);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0]!.isIntersecting;
      if (visible) schedule();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0.05 },
  ).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (visible) schedule();
  });
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    pauseLabel();
    schedule();
  });
  schedule();
}
