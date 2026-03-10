import { m } from 'framer-motion';
import React, { forwardRef } from 'react';

import { Box, Paper, Typography } from '@mui/material';

import { useGetAssetCategoriesTree } from 'src/actions/asset-categories';

// ----------------------------------------------------------------------

interface CategorySidebarProps {
  activeCategory: number;
  onCategoryChange: (index: number) => void;
}

export const CategorySidebar = forwardRef<HTMLDivElement, CategorySidebarProps>(
  ({ activeCategory, onCategoryChange }, ref) => {
    const { data: categories } = useGetAssetCategoriesTree();
    return (
      <Paper
        ref={ref}
        elevation={0}
        sx={{
          borderRadius: 0,
          width: 90,
          borderRight: (theme) => `1px solid ${theme.vars.palette.divider}`,
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 100,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {categories.map((category, index) => {
          const isActive = activeCategory === index;
          return (
            <Box
              key={category.id}
              component={m.div}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(index)}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 2,
                px: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isActive ? 'primary.lighter' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'primary.lighter' : 'action.hover',
                },
              }}
            >
              {/* 激活指示条 */}
              {isActive && (
                <Box
                  component={m.div}
                  layoutId="active-indicator"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    bgcolor: 'primary.main',
                    borderRadius: '0 2px 2px 0',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}

              {/* 图标 */}
              <Typography
                variant="h2"
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  mb: 0.5,
                  transition: 'color 0.2s',
                }}
              >
                {category.icon}
              </Typography>

              {/* 文字 */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  transition: 'color 0.2s',
                }}
              >
                {category.name}
              </Typography>
            </Box>
          );
        })}
      </Paper>
    );
  }
);

CategorySidebar.displayName = 'CategorySidebar';
