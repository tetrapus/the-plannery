export function sortBy<T>(arr: T[], keyFn: (value: T) => number) {
  return arr
    .map((value) => ({ value, key: keyFn(value) }))
    .sort((a, b) => b.key - a.key)
    .map(({ value }) => value);
}
