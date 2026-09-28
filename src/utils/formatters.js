export function formatNumber(n) {
  return Number(n).toLocaleString();
}

export function formatDelta(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
