import { areaPath, linePath, scoreTrend, trendPoints } from '../data/overview';
import { byId, query } from './dom';

export function initOverviewDemo() {
  const panel = byId('overview-panel');
  const review = byId<HTMLButtonElement>('review');
  const checks = byId('checks');
  const attention = byId('attention');
  const policyLabel = query<HTMLSpanElement>('#policy > span');
  const status = byId('review-status');
  const scoreValue = byId('score-value');
  const scoreDelta = byId('score-delta');
  const trendLine = byId('trend-line');
  const trendArea = byId('trend-area');
  const trendEnd = byId('trend-end');
  const trendEndLabel = byId('trend-end-label');

  const total = Number(panel.dataset.total);
  const scoreBefore = Number(panel.dataset.score);
  const scoreAfter = Number(panel.dataset.scoreAfter);
  const row = query<HTMLElement>(`.bar-row[data-policy="${panel.dataset.reviewPolicy}"]`, panel);
  const rowFill = query<HTMLElement>('.bar-fill', row);
  const rowValue = query<HTMLElement>('.bar-value b', row);
  const rowPassing = Number(row.dataset.passing);
  const rowTotal = Number(row.dataset.total);
  const passingBefore = Array.from(panel.querySelectorAll<HTMLElement>('.bar-row')).reduce(
    (n, r) => n + Number(r.dataset.passing),
    0,
  );
  const pad2 = (n: number) => String(n).padStart(2, '0');

  function apply(done: boolean) {
    const score = done ? scoreAfter : scoreBefore;
    const passing = done ? passingBefore + 1 : passingBefore;
    const rowNow = done ? rowPassing + 1 : rowPassing;
    const values = [...scoreTrend.slice(0, -1), score];
    const points = trendPoints(values);
    const last = points[points.length - 1]!;

    scoreValue.textContent = String(score);
    scoreDelta.textContent = `+${score - values[0]!} pts vs 30d ago`;
    trendLine.setAttribute('d', linePath(points));
    trendArea.setAttribute('d', areaPath(points));
    trendEnd.setAttribute('cy', String(last.y));
    trendEndLabel.setAttribute('y', String(last.y - 8));
    trendEndLabel.textContent = `${score}%`;
    rowFill.style.width = `${(rowNow / rowTotal) * 100}%`;
    rowValue.textContent = String(rowNow);
    row.setAttribute('aria-label', `${query('.bar-label', row).textContent}: ${rowNow} of ${rowTotal} checks passing`);
    checks.textContent = `${passing} / ${total}`;
    attention.textContent = pad2(total - passing);
    panel.classList.toggle('is-reviewed', done);
  }

  review.addEventListener('click', () => {
    const done = review.dataset.done !== 'true';
    review.dataset.done = String(done);
    review.textContent = done ? 'Reset ↺' : 'Review →';
    policyLabel.textContent = done ? '✓   Evidence reviewed' : '!   Review evidence';
    status.textContent = done
      ? 'Evidence reviewed. One less thing to chase. (Demo only)'
      : 'An interactive concept. Try reviewing the evidence.';
    apply(done);
  });
}
