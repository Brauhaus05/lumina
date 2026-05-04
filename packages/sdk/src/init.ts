import { mount } from './mount';
import type { LuminaInstance } from './mount';

export interface LuminaInitOptions {
  readonly tenantId: string;
  readonly container: HTMLElement;
  readonly apiUrl?: string;
}

export function init(options: LuminaInitOptions): LuminaInstance {
  if (!options.tenantId) {
    throw new Error('[Lumina] tenantId is required');
  }
  if (!(options.container instanceof HTMLElement)) {
    throw new Error('[Lumina] container must be an HTMLElement');
  }

  const resolvedApiUrl =
    options.apiUrl ??
    (import.meta.env['VITE_READER_URL'] as string | undefined) ??
    '';

  return mount(options.container, { ...options, apiUrl: resolvedApiUrl });
}
