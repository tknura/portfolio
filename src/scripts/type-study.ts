import { byId } from './dom';

export function initTypeStudy() {
  const slider = byId<HTMLInputElement>('distort');
  const output = byId('type-output');
  slider.addEventListener('input', () => {
    const v = Number(slider.value);
    output.style.transform = `skewX(${-v * 0.13}deg) scaleX(${1 - v * 0.0015})`;
    output.style.textShadow = `${v * 0.13}px ${v * 0.025}px #2450e6, ${-v * 0.055}px 0 #91a8bd`;
  });
}
