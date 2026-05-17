export function buildAuthRedirectUrl(origin: string, basePath: string) {
  return new URL(basePath, origin).toString();
}
