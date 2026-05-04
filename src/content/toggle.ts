import { getToggle, setToggle } from '../lib/storage';

const BUTTON_ID = 'gh-pr-kanban-toggle';

export interface ToggleHandle {
  isOn: () => boolean;
  setOn: (on: boolean) => Promise<void>;
  destroy: () => void;
  onChange: (cb: (on: boolean) => void) => void;
}

export async function mountToggle(repo: string): Promise<ToggleHandle> {
  document.getElementById(BUTTON_ID)?.remove();

  let on = await getToggle(repo);
  const listeners: Array<(on: boolean) => void> = [];

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = label(on);
  Object.assign(button.style, {
    position: 'fixed',
    top: '12px',
    right: '16px',
    zIndex: '9999',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#1f2328',
    background: '#ffffff',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
  } satisfies Partial<CSSStyleDeclaration>);

  button.addEventListener('click', async () => {
    on = !on;
    button.textContent = label(on);
    await setToggle(repo, on);
    listeners.forEach((cb) => cb(on));
  });

  document.body.appendChild(button);

  return {
    isOn: () => on,
    setOn: async (next) => {
      on = next;
      button.textContent = label(on);
      await setToggle(repo, on);
      listeners.forEach((cb) => cb(on));
    },
    destroy: () => button.remove(),
    onChange: (cb) => {
      listeners.push(cb);
    },
  };
}

function label(on: boolean): string {
  return on ? 'Table view' : 'Kanban view';
}
