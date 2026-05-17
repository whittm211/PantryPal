import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('android keystore verification helper', () => {
  it('provides a PowerShell verifier for generated local signing outputs', () => {
    expect(existsSync('scripts/verify-android-keystore.ps1')).toBe(true);

    const script = readFileSync('scripts/verify-android-keystore.ps1', 'utf8');
    expect(script).toContain('upload-keystore.jks');
    expect(script).toContain('upload-keystore.base64.txt');
    expect(script).toContain('FromBase64String');
    expect(script).toContain('ANDROID_KEYSTORE_BASE64');
    expect(script).not.toContain('Write-Host $base64');
  });

  it('documents the verifier without exposing generated secret values', () => {
    const docs = readFileSync('ANDROID_SIGNING.md', 'utf8');

    expect(docs).toContain('.\\scripts\\verify-android-keystore.ps1');
    expect(docs).toContain('does not print the base64 secret');
  });
});
