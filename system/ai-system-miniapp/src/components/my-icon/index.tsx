import { Image, View } from '@tarojs/components';
import './index.less';
import * as Icons from '@/icons';
export type IconName = keyof typeof Icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MyIcon({ name, size = 24, color = '#333', className, style }: IconProps) {
  const SvgIcon = Icons[name];
  if (!SvgIcon) return null;
  return (
    <View
      className={`icon ${className || ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        color,
        ...style,
      }}
    >
      <Image
        src={SvgIcon}
        mode="aspectFit"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'block',
        }}
      />
    </View>
  );
}
