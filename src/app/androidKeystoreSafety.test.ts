import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('android keystore safety', () => {
  it('keeps generated Android signing files out of git', () => {
    const gitignore = readFileSync('.gitignore', 'utf8');

    expect(gitignore).toContain('.android-release/');
    expect(gitignore).toContain('*.jks');
    expect(gitignore).toContain('*.keystore');
  });

  it('documents the local keystore helper and required GitHub secrets', () => {
    const docs = readFileSync('MOBILE_RELEASE.md', 'utf8');

    expect(docs).toContain('scripts/generate-android-keystore.ps1');
    expect(docs).toContain('ANDROID_KEYSTORE_BASE64');
    expect(docs).toContain('ANDROID_KEYSTORE_PASSWORD');
    expect(docs).toContain('ANDROID_KEY_ALIAS');
    expect(docs).toContain('ANDROID_KEY_PASSWORD');
  });

  it('provides a PowerShell helper that writes local-only signing outputs', () => {
    const script = readFileSync('scripts/generate-android-keystore.ps1', 'utf8');

    expect(script).toContain('.android-release');
    expect(script).toContain('keytool');
    expect(script).toContain('upload-keystore.base64.txt');
  });
});
