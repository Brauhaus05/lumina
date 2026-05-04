import { render } from 'preact';
import { LuminaApp } from './LuminaApp';
import type { LuminaInitOptions } from './init';
import baseStyles from './styles/base.css?raw';

export interface LuminaInstance {
  destroy: () => void;
}

export function mount(container: HTMLElement, options: LuminaInitOptions): LuminaInstance {
  // Create shadow root for full CSS isolation
  const shadow = container.attachShadow({ mode: 'open' });

  // Inject base styles via constructable stylesheets; fall back to <style> tag
  // for environments that don't support adoptedStyleSheets.
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(baseStyles);
    shadow.adoptedStyleSheets = [sheet];
  } catch {
    const style = document.createElement('style');
    style.textContent = baseStyles;
    shadow.appendChild(style);
  }

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  render(
    <LuminaApp
      apiUrl={options.apiUrl ?? ''}
      apiKey={options.tenantId}
    />,
    mountPoint,
  );

  return {
    destroy: () => {
      render(null, mountPoint);
      container.shadowRoot?.host.replaceChildren();
    },
  };
}
