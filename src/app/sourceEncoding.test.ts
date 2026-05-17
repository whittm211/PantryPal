import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
const mojibakePattern = /(?:Â|Ã|â€|â€™|â€œ|â€�|ï¿½)/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (entry === 'sourceEncoding.test.ts' || entry === 'encoding.test.ts') return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe('source text encoding', () => {
  it('does not contain common mojibake sequences in app source files', () => {
    const offenders = sourceFiles(appRoot)
      .flatMap((file) => readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .map((line, index) => ({ file, line: index + 1, text: line }))
        .filter(({ text }) => mojibakePattern.test(text)))
      .map(({ file, line, text }) => `${file}:${line}: ${text.trim()}`);

    expect(offenders).toEqual([]);
  });
});
