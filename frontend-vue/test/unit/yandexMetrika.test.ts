import { describe, expect, it, vi } from 'vitest';
import { initYandexMetrika } from '@/plugins/yandexMetrika';

describe('initYandexMetrika', () => {
  it('does not inject script in dev mode', () => {
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    initYandexMetrika();

    expect(appendChildSpy).not.toHaveBeenCalled();
    appendChildSpy.mockRestore();
  });
});
