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

  it('keeps the navigation chrome fixed around a bounded scroll area', () => {
    const app = readFileSync('src/app/App.tsx', 'utf8');
    const phoneFrame = readFileSync('src/app/components/PhoneFrame.tsx', 'utf8');

    expect(phoneFrame).toContain("height: '100vh'");
    expect(phoneFrame).toContain("overflow: 'hidden'");
    expect(app).toContain('<main');
    expect(app).toContain('minHeight: 0');
    expect(app).toContain("overflow: 'hidden'");
    const mainIndex = app.indexOf('<main');
    expect(app.lastIndexOf('<TopBar', mainIndex)).toBeGreaterThan(-1);
    expect(mainIndex).toBeLessThan(app.indexOf('<BottomNav', mainIndex));
  });
});
