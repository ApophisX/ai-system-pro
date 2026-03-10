import type { BoxProps } from "@mui/material";

import { Box } from "@mui/material";

export function BackgroundBox(props: BoxProps) {
  return <Box sx={{ height: '100vh', position: 'fixed', zIndex: -999, bgcolor: 'background.default', width: '100%', left: 0, bottom: 0, ...props.sx }} />
}