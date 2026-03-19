/**
 * 紧急联系人单条结构（JSON 项）
 */
export interface EmergencyContactItem {
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 关系类型，如：父母、配偶、子女、朋友等 */
  relationshipType: string;
}
