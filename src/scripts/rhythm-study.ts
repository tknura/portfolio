import { byId, query } from './dom';

export function initRhythmStudy() {
  const button = byId<HTMLButtonElement>('rhythm');
  const bars = query<HTMLElement>('.rhythm-bars');
  let timer: ReturnType<typeof setTimeout> | undefined;

  button.addEventListener('click', () => {
    clearTimeout(timer);
    bars.classList.remove('playing');
    void bars.offsetWidth;
    bars.classList.add('playing');
    button.innerHTML = 'A little rhythm. <span>✳</span>';
    timer = setTimeout(() => {
      bars.classList.remove('playing');
      button.innerHTML = 'Play it again <span>↗</span>';
    }, 2700);
  });
}
