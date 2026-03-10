import { Box, Stack, LinearProgress } from '@mui/material';

export function AssetDetailSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <LinearProgress color="primary" />
      <Stack spacing={1.5}>
        <Box sx={{ height: 400, bgcolor: 'background.paper' }} />
        <Box sx={{ height: 300, bgcolor: 'background.paper' }} />
        <Box sx={{ height: 400, bgcolor: 'background.paper' }} />
        <Box sx={{ height: 200, bgcolor: 'background.paper' }} />
      </Stack>
    </Box>
  );
}
