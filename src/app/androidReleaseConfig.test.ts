import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('android release signing config', () => {
  it('uses GitHub secret-backed environment variables for release signing', () => {
    const gradle = readFileSync('android/app/build.gradle', 'utf8');

    expect(gradle).toContain('ANDROID_KEYSTORE_PATH');
    expect(gradle).toContain('ANDROID_KEYSTORE_PASSWORD');
    expect(gradle).toContain('ANDROID_KEY_ALIAS');
    expect(gradle).toContain('ANDROID_KEY_PASSWORD');
    expect(gradle).toContain('signingConfig signingConfigs.release');
  });

  it('has a manual signed Android App Bundle workflow', () => {
    const workflow = readFileSync('.github/workflows/mobile-android-release.yml', 'utf8');

    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toContain('ANDROID_KEYSTORE_BASE64');
    expect(workflow).toContain("tr -d '[:space:]'");
    expect(workflow).toContain('test -s android/app/upload-keystore.jks');
    expect(workflow).toContain('bundleRelease');
    expect(workflow).toContain('PantryPal-release-aab');
  });
});
