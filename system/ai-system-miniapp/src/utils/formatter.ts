// 距离转换
export function formatDistance(distance?: number) {
  if (!distance) {
    return '-';
  }
  if (distance < 1000) {
    return `${Number(distance.toFixed(2))}m`;
  }
  return `${Number((distance / 1000).toFixed(2))}km`;
}
