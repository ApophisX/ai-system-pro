import { m } from 'framer-motion';

import { Box, Grid, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

const categories = [
  { name: '电动车', icon: '🛵' },
  { name: '工具设备', icon: '🛠️' },
  { name: '摄影器材', icon: '📷' },
  { name: '户外用品', icon: '⛺' },
  { name: '临时办公', icon: '💻' },
  { name: '其他', icon: '📦' },
];

export const CategoryGrid = () => {
  const router = useRouter();
  return (
    <Grid spacing={2} container>
      {categories.map((item) => (
        <CategoryItem
          key={item.name}
          data={item}
          onClick={() => router.push(`${paths.rental.goods.root}?category=${item.name}`)}
        />
      ))}
      <CategoryItem
        key="others"
        data={{
          id: '0',
          code: 'others',
          name: '其他',
          icon: '🔍',
          description: '',
          sortOrder: 0,
          attributes: [],
          displayOnHome: false,
        }}
        onClick={() => router.push(paths.rental.goods.root)}
      />
    </Grid>
  );
};

const CategoryItem = (props: { data: any; onClick: () => void }) => {
  const { data, onClick } = props;
  return (
    <Grid
      size={{ xs: 4 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        bgcolor: (theme) => theme.vars.palette.background.default,
        boxShadow: (theme) => theme.vars.customShadows.z8,
        borderRadius: 2,
      }}
      onClick={onClick}
    >
      <Typography variant="h1" sx={{ mb: 1 }}>
        {data.icon}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {data.name}
      </Typography>
    </Grid>
  );
};
