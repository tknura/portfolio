import { byId } from './dom';
import { reducedMotion } from './reduced-motion';

export function initBugButton(openContact: (bug: boolean) => void) {
  const bug = byId<HTMLButtonElement>('bug-button');
  const arena = byId('bug-arena');
  const status = byId('bug-status');
  let escapes = 0;
  let keyboard = false;
  let lastEscape = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') keyboard = true;
  });
  document.addEventListener('pointerdown', () => {
    keyboard = false;
  });

  function escape() {
    if (reducedMotion.matches || keyboard || escapes >= 2 || Date.now() - lastEscape < 450) return false;
    lastEscape = Date.now();
    const maxX = Math.max(0, arena.clientWidth - bug.offsetWidth - 20);
    const maxY = Math.max(0, arena.clientHeight - bug.offsetHeight - 65);
    bug.style.left = `${escapes === 0 ? Math.max(10, maxX) : 10}px`;
    bug.style.top = `${escapes === 0 ? 10 : Math.max(10, maxY)}px`;
    escapes++;
    status.textContent = escapes === 1 ? 'Huh. Weird. Works on my machine.' : 'Okay, you’re persistent. I like that.';
    return true;
  }

  bug.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') escape();
  });
  bug.addEventListener('click', (e) => {
    if (e.detail === 0 || keyboard || reducedMotion.matches || escapes >= 2) {
      openContact(true);
      return;
    }
    escape();
  });
  bug.addEventListener('focus', () => {
    if (keyboard) status.textContent = 'Keyboard user? Straight to the point. Respect.';
  });
}
