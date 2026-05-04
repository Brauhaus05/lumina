import type { TiptapDocument } from '@lumina/types';

export type ValidationResult =
  | { valid: true; doc: TiptapDocument }
  | { valid: false; error: string };

export function validateTiptapDoc(value: unknown): ValidationResult {
  if (typeof value !== 'object' || value === null) {
    return { valid: false, error: 'Content must be an object' };
  }
  const obj = value as Record<string, unknown>;
  if (obj['type'] !== 'doc') {
    return { valid: false, error: 'Content root must have type "doc"' };
  }
  if (!Array.isArray(obj['content'])) {
    return { valid: false, error: 'Content must have a "content" array' };
  }
  return { valid: true, doc: value as TiptapDocument };
}
