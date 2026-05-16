export function buildAuthProfileMetadata(displayName: string) {
  const name = normalizeAuthProfileName(displayName);
  return {
    display_name: name,
    full_name: name,
    name,
  };
}

export function normalizeAuthProfileName(displayName: string) {
  return displayName.trim().replace(/\s+/g, ' ');
}
