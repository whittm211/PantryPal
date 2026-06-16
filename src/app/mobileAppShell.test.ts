import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('mobile app shell', () => {
  it('does not render prototype phone chrome in the runtime app', () => {
    const app = readFileSync('src/app/App.tsx', 'utf8');
    const phoneFrame = readFileSync('src/app/components/PhoneFrame.tsx', 'utf8');

    expect(app).not.toContain('<StatusBar');
    expect(phoneFrame).not.toContain('boxShadow');
    expect(phoneFrame).not.toContain('borderRadius: 48');
    expect(phoneFrame).not.toContain('Notch');
    expect(phoneFrame).not.toContain('width: 390');
    expect(phoneFrame).not.toContain('height: 844');
  });
});
