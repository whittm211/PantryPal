import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('android signing prep worksheet', () => {
  it('documents the Android upload keystore workflow and required GitHub secrets', () => {
    const docs = readFileSync('ANDROID_SIGNING.md', 'utf8');

    expect(docs).toContain('upload-keystore.jks');
    expect(docs).toContain('upload-keystore.base64.txt');
    expect(docs).toContain('ANDROID_KEYSTORE_BASE64');
    expect(docs).toContain('ANDROID_KEYSTORE_PASSWORD');
    expect(docs).toContain('ANDROID_KEY_ALIAS');
    expect(docs).toContain('ANDROID_KEY_PASSWORD');
    expect(docs).toContain('Mobile Android Release Bundle');
  });

  it('makes the keystore backup and non-commit rules explicit', () => {
    const docs = readFileSync('ANDROID_SIGNING.md', 'utf8');

    expect(docs).toContain('Do not commit');
    expect(docs).toContain('backed up');
    expect(docs).toContain('.android-release/');
    expect(docs).toContain('keytool');
  });
});
