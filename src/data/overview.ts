export interface PolicyGroup {
  id: string;
  label: string;
  passing: number;
  total: number;
}

export const scoreTrend = [
  71, 72, 72, 74, 73, 75, 77, 76, 78, 78, 80, 79, 81, 82, 82, 81, 83, 84, 84, 83, 85, 84, 86, 85, 84, 83, 84, 85, 84,
  84,
];

export const policyGroups: PolicyGroup[] = [
  { id: 'source', label: 'Source', passing: 6, total: 6 },
  { id: 'build', label: 'Build integrity', passing: 5, total: 5 },
  { id: 'dependencies', label: 'Dependencies', passing: 4, total: 5 },
  { id: 'scanning', label: 'Scanning', passing: 4, total: 5 },
  { id: 'evidence', label: 'Evidence', passing: 2, total: 4 },
];

export const reviewedState = {
  policyId: 'evidence',
  scoreAfter: 88,
};

export const chart = {
  width: 360,
  height: 120,
  padTop: 14,
  padBottom: 18,
  padLeft: 6,
  padRight: 30,
  min: 60,
  max: 100,
};

export function trendPoints(values: number[]) {
  const innerW = chart.width - chart.padLeft - chart.padRight;
  const innerH = chart.height - chart.padTop - chart.padBottom;
  return values.map((v, i) => ({
    x: chart.padLeft + (i / (values.length - 1)) * innerW,
    y: chart.padTop + innerH - ((v - chart.min) / (chart.max - chart.min)) * innerH,
    value: v,
    day: values.length - 1 - i,
  }));
}

export function linePath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

export function areaPath(points: { x: number; y: number }[]) {
  const base = chart.height - chart.padBottom;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `${linePath(points)} L${last.x.toFixed(1)} ${base} L${first.x.toFixed(1)} ${base} Z`;
}

export function sparkPath(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 2 - ((v - min) / span) * (height - 4);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
