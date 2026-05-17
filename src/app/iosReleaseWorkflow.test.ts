import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('ios release archive workflow', () => {
  it('defines a manual signed iOS archive workflow for TestFlight/App Store builds', () => {
    const workflow = readFileSync('.github/workflows/mobile-ios-release.yml', 'utf8');

    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toContain('macos');
    expect(workflow).toContain('IOS_CERTIFICATE_BASE64');
    expect(workflow).toContain('IOS_PROVISION_PROFILE_BASE64');
    expect(workflow).toContain('IOS_EXPORT_OPTIONS_PLIST_BASE64');
    expect(workflow).toContain('security create-keychain');
    expect(workflow).toContain('xcodebuild archive');
    expect(workflow).toContain('xcodebuild -exportArchive');
    expect(workflow).toContain('PantryPal-ios-release');
  });

  it('documents the iOS signing secrets required for release archives', () => {
    const docs = readFileSync('MOBILE_RELEASE.md', 'utf8');

    expect(docs).toContain('Mobile iOS Release Archive');
    expect(docs).toContain('IOS_CERTIFICATE_BASE64');
    expect(docs).toContain('IOS_PROVISION_PROFILE_BASE64');
    expect(docs).toContain('IOS_EXPORT_OPTIONS_PLIST_BASE64');
    expect(docs).toContain('TestFlight');
  });
});
