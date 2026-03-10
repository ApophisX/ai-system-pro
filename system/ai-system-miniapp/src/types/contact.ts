export interface ContactItem {
  id: string | number;
  name: string; // 姓名
  mobile: string; // 手机号 (用于展示: 138 **** 8888)
  rawMobile: string; // 原始手机号 (用于拨打)
  tag: string; // 标签：本人、子女、老伴、护工、邻居
  isDefault: boolean; // 是否默认
  address?: string; // (可选) 如果服务需要上门，可能包含地址简写
}
