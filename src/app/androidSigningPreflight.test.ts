import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('android signing preflight helper', () => {
  it('provides a PowerShell preflight script for Java and keytool checks', () => {
    expect(existsSync('scripts/check-android-signing-prereqs.ps1')).toBe(true);

    const script = readFileSync('scripts/check-android-signing-prereqs.ps1', 'utf8');
    expect(script).toContain('JAVA_HOME');
    expect(script).toContain('keytool');
    expect(script).toContain('java');
    expect(script).toContain('generate-android-keystore.ps1');
  });

  it('documents the preflight command before generating private signing files', () => {
    const docs = readFileSync('ANDROID_SIGNING.md', 'utf8');

    expect(docs).toContain('.\\scripts\\check-android-signing-prereqs.ps1');
    expect(docs).toContain('before generating the upload keystore');
  });
});
