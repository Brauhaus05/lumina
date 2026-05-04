import type { ThemeConfig } from '@lumina/types';

export function resolveToCssVars(theme: ThemeConfig): string {
  const vars: string[] = [
    `--lumina-color-primary: ${theme.colors.primary};`,
    `--lumina-color-background: ${theme.colors.background};`,
    `--lumina-color-text: ${theme.colors.text};`,
  ];

  if (theme.colors.accent) {
    vars.push(`--lumina-color-accent: ${theme.colors.accent};`);
  }
  vars.push(`--lumina-font-family: ${theme.typography.fontFamily};`);
  vars.push(`--lumina-font-size: ${theme.typography.fontSize};`);

  return `:root { ${vars.join(' ')} }`;
}
