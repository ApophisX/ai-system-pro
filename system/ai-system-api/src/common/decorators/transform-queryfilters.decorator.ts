import { Transform } from 'class-transformer';

function getFilterItem(value: string) {
  const [field, operator, ...restValue] = value.split(',');
  let fValue: string | string[] = restValue;
  if (['in', 'not in', 'isAnyOf', 'not', 'EXISTS'].includes(operator)) {
    fValue = restValue?.filter(Boolean) || [];
  } else {
    fValue = restValue[0];
  }
  return { field, operator: operator, value: fValue };
}

function transformFilterValue(value: string | string[]) {
  if (value) {
    if (typeof value === 'string') {
      const item = getFilterItem(value);
      return [item];
    } else if (Array.isArray(value)) {
      return value.map(item => {
        return getFilterItem(item);
      });
    }
  }
  return value;
}

// 自定义 Transform 装饰器
export function TransformFilters() {
  return Transform(({ value }) => {
    if (value) {
      return transformFilterValue(value as string | string[]);
    }
    return value;
  });
}
