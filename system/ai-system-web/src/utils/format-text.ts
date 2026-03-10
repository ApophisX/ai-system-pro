/**
 * 如果编号超过18位，则展示前4位和后6位，中间用*填充，长度为剩余长度
 * 如果编号不超过12位，则直接返回编号
 * @param code 编号
 * @returns 格式化后的编号
 */
export function formatCode(code: string = '', suffixLength = 6) {
  if (code.length > 18) {
    return code.slice(0, 4) + '*'.repeat(18 - suffixLength - 4) + code.slice(-suffixLength);
  }
  return code;
}
