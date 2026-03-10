import { m } from 'framer-motion';

import { Box, Button, Typography } from '@mui/material';

const scenarios = [
  { title: '临时用一天', desc: '周末搬家/清理', color: '#eff6ff' },
  { title: '出差 3 天', desc: '办公投影/笔记本', color: '#f0fdf4' },
  { title: '坏了先顶下', desc: '备用机/代步车', color: '#fff7ed' },
];

export const ScenarioCards = () => (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
      场景选物
    </Typography>
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        pb: 2,
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {scenarios.map((s) => (
        <Box
          component={m.div}
          whileTap={{ scale: 0.95 }}
          key={s.title}
          sx={{
            minWidth: 160,
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => theme.vars.palette.background.default,
            boxShadow: (theme) => theme.vars.customShadows.z8,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {s.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {s.desc}
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button color="primary" variant="text">
              去看看 →
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);
