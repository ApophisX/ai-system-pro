import type { BoxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import { m } from 'framer-motion';

import { Box, useTheme, Typography } from '@mui/material';

type StatusStampColor = 'error' | 'success' | 'primary' | 'warning' | 'info' | string;

type StatusStampProps = {
  /** 印章显示的文字 */
  label: string;
  /** 印章颜色，可以是主题色名称（'error', 'success' 等）或自定义颜色值 */
  color?: StatusStampColor;
  /** 自定义位置 */
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  size?: number;
} & BoxProps;

/**
 * 获取颜色值
 */
const getColorValue = (theme: Theme, color: StatusStampColor): string => {
  if (
    color === 'error' ||
    color === 'success' ||
    color === 'primary' ||
    color === 'warning' ||
    color === 'info'
  ) {
    return theme.palette[color].main;
  }
  return color;
};

/**
 * 获取颜色的 RGB 值（用于渐变背景）
 */
const getColorRgb = (theme: Theme, color: StatusStampColor): string => {
  const colorValue = getColorValue(theme, color);
  // 如果是主题色，从 theme 中获取 RGB
  if (
    color === 'error' ||
    color === 'success' ||
    color === 'primary' ||
    color === 'warning' ||
    color === 'info'
  ) {
    const rgb = theme.palette[color].main;
    // 从 hex 转换为 rgb
    const hex = rgb.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  // 自定义颜色，尝试解析
  if (colorValue.startsWith('#')) {
    const hex = colorValue.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  // 如果是 rgb/rgba 格式，提取数字
  const match = colorValue.match(/\d+/g);
  if (match && match.length >= 3) {
    return `${match[0]}, ${match[1]}, ${match[2]}`;
  }
  // 默认返回红色
  return '211, 47, 47';
};

export function StatusStamp({
  label,
  color = 'error',
  size = 130,
  top = 16,
  right = 16,
  bottom,
  left,
  ...other
}: StatusStampProps) {
  const t = useTheme();
  const colorValue = getColorValue(t, color);
  const colorRgb = getColorRgb(t, color);

  return (
    <Box
      component={m.div}
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: -15 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.2,
      }}
      sx={{
        position: 'absolute',
        ...(top !== undefined && { top }),
        ...(right !== undefined && { right }),
        ...(bottom !== undefined && { bottom }),
        ...(left !== undefined && { left }),
        zIndex: 10,
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${(5 * size) / 130}px solid`,
        borderColor: colorValue,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, rgba(${colorRgb}, 0.15) 0%, rgba(${colorRgb}, 0.05) 100%)`
            : `linear-gradient(135deg, rgba(${colorRgb}, 0.12) 0%, rgba(${colorRgb}, 0.04) 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: (theme) => {
          const shadowColor = colorValue;
          return theme.palette.mode === 'dark'
            ? `0 8px 32px ${shadowColor}30, inset 0 0 20px ${shadowColor}10`
            : `0 8px 32px ${shadowColor}25, inset 0 0 20px ${shadowColor}08`;
        },
        pointerEvents: 'none',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '85%',
          height: '85%',
          borderRadius: '50%',
          border: '3px solid',
          borderColor: colorValue,
          opacity: 0.4,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          border: '1px solid',
          borderColor: colorValue,
          opacity: 0.2,
        },
        ...other.sx,
      }}
    >
      <Typography
        component="div"
        sx={{
          color: colorValue,
          fontWeight: 900,
          fontSize: 20 * (size / 130),
          letterSpacing: 3 * (size / 130),
          textAlign: 'center',
          lineHeight: 1.3,
          position: 'relative',
          zIndex: 1,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '55%',
          height: '2px',
          background: (theme) => `linear-gradient(90deg, transparent, ${colorValue}, transparent)`,
          opacity: 0.6,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '55%',
          height: '2px',
          background: (theme) => `linear-gradient(90deg, transparent, ${colorValue}, transparent)`,
          opacity: 0.6,
        }}
      />
    </Box>
  );
}
