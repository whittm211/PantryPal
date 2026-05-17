import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('ios build workflow', () => {
  it('defines a manual macOS simulator build for the Capacitor iOS project', () => {
    const workflow = readFileSync('.github/workflows/mobile-ios.yml', 'utf8');

    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toContain('macos');
    expect(workflow).toContain('npx cap sync ios');
    expect(workflow).toContain('xcodebuild');
    expect(workflow).toContain('CODE_SIGNING_ALLOWED=NO');
  });

  it('documents the iOS CI build and signing boundary', () => {
    const docs = readFileSync('MOBILE_RELEASE.md', 'utf8');

    expect(docs).toContain('Mobile iOS Build');
    expect(docs).toContain('simulator build');
    expect(docs).toContain('does not create a signed App Store build');
  });
});
