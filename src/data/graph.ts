export type NodeKind = 'attestation' | 'container' | 'sbom' | 'git' | 'sarif' | 'artifact';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  name: string;
  x: number;
  y: number;
  r: number;
}

export type GraphLink = [string, string];

export const palette: Record<NodeKind, string> = {
  attestation: '#111820',
  container: '#46a6d4',
  sbom: '#eaa24f',
  git: '#59b76c',
  sarif: '#d9b844',
  artifact: '#ec9242',
};

export const legend: { kind: NodeKind; label: string }[] = [
  { kind: 'attestation', label: 'Attestation' },
  { kind: 'container', label: 'Container image' },
  { kind: 'sbom', label: 'SBOM' },
  { kind: 'git', label: 'Git commit' },
  { kind: 'sarif', label: 'SARIF' },
];

export const icons: Partial<Record<NodeKind, string>> = {
  container: 'M-7 0 0-7 7 0 0 7Z M0-7V7 M-7 0H7',
  sbom: 'M-5-6H5V-2H-5Z M-5 2H5V6H-5Z',
  git: 'M-3-6V6 M-3 3Q5 3 5-5 M-5-6h4 M3-5h4',
  sarif: 'M-5-7H2L6-3V7H-5Z M-2 4V0 M1 4V-3 M4 4V1',
  artifact: 'M0-7 6-3V4L0 7-6 4V-3Z M-6-3 0 0 6-3 M0 0V7',
};

export const initialSelection = 'release';

export function buildGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [
    { id: 'release', kind: 'attestation', name: 'Release attestation', x: 460, y: 245, r: 18 },
    { id: 'commit', kind: 'git', name: 'Source commit', x: 205, y: 352, r: 15 },
    { id: 'build', kind: 'attestation', name: 'Build attestation', x: 102, y: 405, r: 16 },
    { id: 'scan', kind: 'attestation', name: 'Scan attestation', x: 755, y: 170, r: 16 },
    { id: 'report', kind: 'sarif', name: 'Security report', x: 870, y: 80, r: 15 },
  ];
  const links: GraphLink[] = [
    ['release', 'commit'],
    ['commit', 'build'],
    ['release', 'scan'],
    ['scan', 'report'],
  ];

  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    const kind: NodeKind = i % 3 === 0 ? 'sbom' : 'container';
    nodes.push({
      id: `e${i}`,
      kind,
      name: kind === 'sbom' ? `Dependency inventory ${Math.floor(i / 3) + 1}` : `Container image ${i + 1}`,
      x: 460 + Math.cos(t) * 125,
      y: 245 + Math.sin(t) * 125,
      r: 14,
    });
    links.push(['release', `e${i}`]);
  }

  const leaves: [string, NodeKind, string, number, number, string][] = [
    ['source', 'git', 'Build source', 95, 285, 'commit'],
    ['sarif', 'sarif', 'Static analysis report', 22, 335, 'build'],
    ['artifact', 'artifact', 'Build artifact', 24, 425, 'build'],
    ['bom', 'sbom', 'Build dependencies', 77, 486, 'build'],
    ['image', 'container', 'Built container', 180, 467, 'build'],
    ['scan-source', 'git', 'Scan source', 700, 60, 'scan'],
    ['scan-run', 'attestation', 'Scanner attestation', 947, 31, 'report'],
    ['scan-check', 'attestation', 'Policy attestation', 963, 107, 'report'],
    ['scan-extra', 'attestation', 'Verification attestation', 933, 183, 'report'],
  ];
  for (const [id, kind, name, x, y, parent] of leaves) {
    nodes.push({ id, kind, name, x, y, r: kind === 'attestation' ? 15 : 14 });
    links.push([parent, id]);
  }

  return { nodes, links };
}
