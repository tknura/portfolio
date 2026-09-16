import { byId } from './dom';

export function initPlayground() {
  const button = byId<HTMLButtonElement>('save-button');
  const label = byId('save-label');
  const icon = byId('save-icon');
  const status = byId('save-status');
  const stage = byId('button-stage');
  const plain = byId<HTMLButtonElement>('plain-mode');
  const nice = byId<HTMLButtonElement>('nice-mode');
  const caption = byId('mode-caption');

  let polished = true;
  let saving = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function setMode(isNice: boolean) {
    polished = isNice;
    clearTimeout(timer);
    saving = false;
    button.disabled = false;
    button.classList.remove('is-loading', 'is-saved');
    button.setAttribute('aria-busy', 'false');
    label.textContent = 'Save something';
    icon.textContent = '↗';
    status.textContent = isNice ? 'Nothing important. Just a very good button.' : 'A button. It does what it says.';
    plain.setAttribute('aria-pressed', String(!isNice));
    nice.setAttribute('aria-pressed', String(isNice));
    stage.className = 'button-stage' + (isNice ? ' polished' : '');
    caption.textContent = isNice ? 'FEEDBACK + MOTION + A LITTLE JOY' : 'FUNCTIONAL. AND THAT’S ABOUT IT.';
  }
  plain.addEventListener('click', () => setMode(false));
  nice.addEventListener('click', () => setMode(true));

  button.addEventListener('click', () => {
    if (saving) return;
    clearTimeout(timer);
    if (!polished) {
      status.textContent = 'Saved.';
      return;
    }
    saving = true;
    button.disabled = true;
    button.classList.remove('is-saved');
    button.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');
    stage.classList.remove('celebrate');
    label.textContent = 'Saving something';
    icon.textContent = '';
    status.textContent = 'Putting the finishing touches on…';
    timer = setTimeout(() => {
      button.classList.remove('is-loading');
      button.classList.add('is-saved');
      button.setAttribute('aria-busy', 'false');
      label.textContent = 'All taken care of.';
      icon.textContent = '✓';
      status.textContent = 'A little anticipation. A satisfying finish.';
      stage.classList.add('celebrate');
      saving = false;
      button.disabled = false;
      timer = setTimeout(() => {
        button.classList.remove('is-saved');
        stage.classList.remove('celebrate');
        label.textContent = 'One more time?';
        icon.textContent = '↺';
      }, 2200);
    }, 1450);
  });
}
