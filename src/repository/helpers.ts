export function makeLimit(defaultLimit: number, hardLimit: number, limit?: number): number {
  if (limit !== undefined) {
    return (limit > hardLimit ? hardLimit : limit);
  }
  return (defaultLimit > hardLimit ? hardLimit : defaultLimit);
}
