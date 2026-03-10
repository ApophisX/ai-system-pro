import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { FinanceDirection } from '../enums';

/**
 * 财务方向验证器
 *
 * 约束规则：
 * - direction = INCOME 时，incomeType 必填，expenseType 必须为空
 * - direction = EXPENSE 时，expenseType 必填，incomeType 必须为空
 */
@ValidatorConstraint({ name: 'financeDirection', async: false })
export class FinanceDirectionValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const obj = args.object as any;
    const direction = obj.direction as FinanceDirection;
    const incomeType = obj.incomeType;
    const expenseType = obj.expenseType;

    if (!direction) {
      return false;
    }

    if (direction === FinanceDirection.INCOME) {
      // 收入时，incomeType 必填，expenseType 必须为空
      return !!incomeType && !expenseType;
    } else if (direction === FinanceDirection.EXPENSE) {
      // 支出时，expenseType 必填，incomeType 必须为空
      return !!expenseType && !incomeType;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as any;
    const direction = obj.direction as FinanceDirection;

    if (direction === FinanceDirection.INCOME) {
      return '当账务方向为收入时，收入类型必填且支出类型必须为空';
    } else if (direction === FinanceDirection.EXPENSE) {
      return '当账务方向为支出时，支出类型必填且收入类型必须为空';
    }

    return '账务方向和类型不匹配';
  }
}

/**
 * 财务方向验证装饰器
 *
 * @param validationOptions 验证选项
 */
export function IsValidFinanceDirection(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FinanceDirectionValidator,
    });
  };
}
