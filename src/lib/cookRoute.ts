export function parseCookSessionIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/cook\/([^/?#]+)/);
  const segment = match?.[1];

  if (!segment || segment === 'index') {
    return undefined;
  }

  return segment;
}
