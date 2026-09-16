import { byId, query } from './dom';

let lastFocus: Element | null = null;

export function openContact(bug = false) {
  const dialog = byId<HTMLDialogElement>('contact-dialog');
  const kicker = byId('dialog-kicker');
  const title = byId('dialog-title');
  const copy = byId('dialog-copy');
  lastFocus = document.activeElement;
  kicker.textContent = bug ? 'QUALITY ASSURANCE / YOU WIN.' : 'YOU MADE IT.';
  title.textContent = bug ? 'Tell me what I broke.' : 'Let’s make something good.';
  copy.textContent = bug
    ? 'Okay, you’re persistent. I like that. The runaway button was intentional; contact details will be added before this portfolio launches.'
    : 'This portfolio is taking shape. Tomasz’s contact details haven’t been added yet.';
  dialog.showModal();
}

export function initContactDialog() {
  const dialog = byId<HTMLDialogElement>('contact-dialog');
  function close() {
    dialog.close();
    (lastFocus as HTMLElement | null)?.focus();
  }

  byId('contact-open').addEventListener('click', () => openContact());
  query('.dialog-close', dialog).addEventListener('click', close);
  query('.dialog-done', dialog).addEventListener('click', close);
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
}
