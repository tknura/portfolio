import type { GraphLink, GraphNode } from '../data/graph';

export interface PhysicsNode extends GraphNode {
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  fx: number | null;
  fy: number | null;
}

export class GraphPhysics {
  nodes: PhysicsNode[];
  links: [PhysicsNode, PhysicsNode][];
  alpha = 1;

  constructor(nodes: PhysicsNode[], links: GraphLink[]) {
    this.nodes = nodes;
    const map = new Map(nodes.map((n) => [n.id, n]));
    this.links = links.map(([a, b]) => [map.get(a)!, map.get(b)!]);
    for (const n of nodes) {
      n.vx = 0;
      n.vy = 0;
      n.homeX = n.x;
      n.homeY = n.y;
    }
  }

  reheat(value = 0.6) {
    this.alpha = Math.max(this.alpha, value);
  }

  tick(): boolean {
    const nodes = this.nodes;
    const a = this.alpha;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n = nodes[i]!;
        const m = nodes[j]!;
        let dx = m.x - n.x;
        let dy = m.y - n.y;
        let d = Math.hypot(dx, dy);
        if (d < 0.001) {
          dx = 0.1;
          dy = 0.1;
          d = Math.hypot(dx, dy);
        }
        const ux = dx / d;
        const uy = dy / d;
        const repel = Math.min(2.5, 600 / (d * d)) * a;
        n.vx -= ux * repel;
        n.vy -= uy * repel;
        m.vx += ux * repel;
        m.vy += uy * repel;
      }
    }

    for (const [n, m] of this.links) {
      const dx = m.x - n.x;
      const dy = m.y - n.y;
      const d = Math.hypot(dx, dy) || 1;
      const hub = n.kind === 'attestation' && m.kind === 'attestation';
      const length = hub ? 210 : n.kind === 'attestation' && m.id.startsWith('e') ? 108 : 90;
      const f = (d - length) * 0.036 * a;
      n.vx += (dx / d) * f;
      n.vy += (dy / d) * f;
      m.vx -= (dx / d) * f;
      m.vy -= (dy / d) * f;
    }

    for (const n of nodes) {
      n.vx += (n.homeX - n.x) * 0.0018 * a;
      n.vy += (n.homeY - n.y) * 0.0018 * a;
      n.vx *= 0.78;
      n.vy *= 0.78;
      if (n.fx != null && n.fy != null) {
        n.x = n.fx;
        n.y = n.fy;
        n.vx = n.vy = 0;
      } else {
        n.x += Math.max(-12, Math.min(12, n.vx));
        n.y += Math.max(-12, Math.min(12, n.vy));
      }
    }

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n = nodes[i]!;
          const m = nodes[j]!;
          const dx = m.x - n.x;
          const dy = m.y - n.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const min = n.r + m.r + 15;
          if (d >= min) continue;
          const ux = d === 0.001 ? 1 : dx / d;
          const uy = d === 0.001 ? 0 : dy / d;
          const push = (min - d) * 0.52;
          if (n.fx == null) {
            n.x -= ux * push;
            n.y -= uy * push;
          }
          if (m.fx == null) {
            m.x += ux * push;
            m.y += uy * push;
          }
        }
      }
    }

    this.alpha *= 0.974;
    return this.alpha > 0.008;
  }

  settle(steps = 180) {
    for (let i = 0; i < steps; i++) this.tick();
  }
}
