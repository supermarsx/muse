import { describe, it, expect, vi } from 'vitest';

vi.mock('../special', () => ({
  initToast: vi.fn(),
  dismissToast: vi.fn(),
  showToast: vi.fn().mockReturnValue('toast-id'),
  addGoToTopAndBottomButtons: vi.fn().mockReturnValue(document.createElement('div')),
  Special: {
    Element: {
      Toast: {
        init: vi.fn(),
        dismiss: vi.fn(),
        message: vi.fn(),
      },
      addButtonGoToTopAndBottom: vi.fn(),
      addTopBottom: vi.fn(),
    },
  },
}));

import {
  initToast,
  dismissToast,
  showToast,
  addGoToTopAndBottomButtons,
  Special,
} from '../special';

describe('special (mocked – solid-toast/render-jsx cannot run in happy-dom)', () => {
  it('calls initToast without errors', () => {
    expect(() => initToast({ position: 'bottom-left', gutter: 8 })).not.toThrow();
    expect(initToast).toHaveBeenCalled();
  });

  it('calls dismissToast without errors', () => {
    expect(() => dismissToast('some-id')).not.toThrow();
    expect(dismissToast).toHaveBeenCalledWith('some-id');
  });

  it('showToast returns a toast ID', () => {
    const id = showToast({ message: 'hello', type: 'default' });
    expect(id).toBe('toast-id');
    expect(showToast).toHaveBeenCalledWith({ message: 'hello', type: 'default' });
  });

  it('addGoToTopAndBottomButtons returns an HTMLElement', () => {
    const el = addGoToTopAndBottomButtons();
    expect(el).toBeInstanceOf(HTMLDivElement);
  });

  it('exports backward-compatible Special namespace structure', () => {
    expect(Special.Element).toBeDefined();
    expect(Special.Element.Toast).toBeDefined();
    expect(Special.Element.Toast.init).toBeTypeOf('function');
    expect(Special.Element.Toast.dismiss).toBeTypeOf('function');
    expect(Special.Element.Toast.message).toBeTypeOf('function');
    expect(Special.Element.addButtonGoToTopAndBottom).toBeTypeOf('function');
    expect(Special.Element.addTopBottom).toBeTypeOf('function');
  });
});
