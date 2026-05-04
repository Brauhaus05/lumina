import { init } from './init';

// Attach to window for <script> tag usage
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>)['Lumina'] = { init };
}

export { init };
export type { LuminaInitOptions } from './init';
export type { LuminaInstance } from './mount';
