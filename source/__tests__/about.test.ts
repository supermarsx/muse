import { describe, it, expect } from 'vitest';
import { version, libraryName, description, About } from '../about';

describe('about', () => {
  it('exports a version string', () => {
    expect(version).toBe('2.0.0');
    expect(typeof version).toBe('string');
  });

  it('exports the library name', () => {
    expect(libraryName).toBe('_muse');
  });

  it('exports a description', () => {
    expect(description).toContain('_muse');
  });

  it('exports backward-compatible About namespace', () => {
    expect(About.version).toBe(version);
    expect(About.libraryName).toBe(libraryName);
    expect(About.description).toBe(description);
  });
});
