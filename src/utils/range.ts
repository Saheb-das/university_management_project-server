export function getYearRange(startYear: number, endYear: number): number[] {
  const range: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    range.push(year);
  }
  return range;
}
