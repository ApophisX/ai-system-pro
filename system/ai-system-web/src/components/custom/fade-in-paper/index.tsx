import type { BoxProps, PaperProps } from '@mui/material';

import { m } from 'framer-motion';

import { Box, Paper } from '@mui/material';

import { varFade } from 'src/components/animate';

export function FadeInPaper({ children, ...other }: PaperProps) {
  return (
    <Paper
      component={m.div}
      variants={varFade('in')}
      // initial="initial"
      // animate="animate"
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      {...other}
      sx={{
        p: 3,
        borderRadius: 1,
        boxShadow: (theme) => theme.customShadows.card,
        ...other?.sx,
      }}
    >
      {children}
    </Paper>
  );
}

export function FadeInBox({ children, ...other }: BoxProps) {
  return (
    <Box
      component={m.div}
      variants={varFade('in')}
      // initial="initial"
      // animate="animate"
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      {...other}
    >
      {children}
    </Box>
  );
}
