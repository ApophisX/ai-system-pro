import React from 'react';
import { m } from 'framer-motion';
import { Flame, Clock, MapPin, Sparkles, ArrowDownUp } from 'lucide-react';

import { Box, Stack, Paper, Typography } from '@mui/material';

import { useGetAssetCategories } from 'src/actions/asset-categories';

// ----------------------------------------------------------------------

export type AssetSortBy = MyApi.AppAssetControllerGetAssetListV1Params['sortBy'];

interface GoodsFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy?: AssetSortBy;
  onSortChange: (sort: AssetSortBy) => void;
}

const sortOptions: {
  id: AssetSortBy;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'recommend', label: '推荐', icon: <Flame size={14} /> },
  { id: 'nearby', label: '附近', icon: <MapPin size={14} /> },
  { id: 'newest', label: '最新', icon: <Clock size={14} /> },
  { id: 'price', label: '价格', icon: <ArrowDownUp size={14} /> },
];

export function GoodsFilter(props: GoodsFilterProps) {
  const { activeCategory, onCategoryChange, sortBy, onSortChange } = props;
  const { data: categories } = useGetAssetCategories();
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        top: 56,
        zIndex: 100,
        borderRadius: 0,
        bgcolor: 'background.paper',
        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      {/* 分类滚动栏 */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <CategoryItem
          key="all"
          data={{ id: 'all', name: '全部' }}
          icon={<Sparkles size={16} />}
          onClick={() => onCategoryChange('all')}
          isActive={activeCategory === 'all' || !activeCategory}
        />

        {categories.map((cat) => {
          const isActive = activeCategory === cat.code;
          return (
            <CategoryItem
              key={cat.id}
              data={{ id: cat.id, name: cat.name || '' }}
              icon={cat.icon}
              onClick={() => onCategoryChange(cat.code)}
              isActive={isActive}
            />
          );
        })}
      </Stack>

      {/* 排序栏 */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          px: 2,
          pb: 1.5,
        }}
      >
        {sortOptions.map((option) => {
          const isActive = sortBy === option.id;
          return (
            <Box
              key={option.id}
              component={m.div}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSortChange(option.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                color: isActive ? 'primary.main' : 'text.secondary',
                transition: 'color 0.2s',
              }}
            >
              {option.icon}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {option.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

const CategoryItem = (props: {
  data: { id: string; name: string };
  icon: any;
  onClick: () => void;
  isActive: boolean;
}) => {
  const { data, icon, onClick, isActive } = props;
  return (
    <Box
      key={data.id}
      component={m.div}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      sx={{
        position: 'relative',
        flexShrink: 0,
        px: 2,
        py: 0.8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        borderRadius: 4,
        transition: 'all 0.3s ease',
        bgcolor: isActive ? 'primary.main' : (theme) => theme.vars.palette.background.default,
        color: isActive ? '#fff' : 'text.secondary',
        '&:hover': {
          bgcolor: isActive ? 'primary.main' : 'primary.main',
          color: '#fff',
        },
      }}
    >
      {icon}
      <Typography
        variant="body2"
        sx={{
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          '&:hover': {
            color: '#fff',
          },
        }}
      >
        {data.name}
      </Typography>
    </Box>
  );
};
