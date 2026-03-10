import type { IconifyName } from 'src/components/iconify';

import React from 'react';
import { m } from 'framer-motion';

import { Box, Grid, Paper, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetAssetCategoriesTree } from 'src/actions/asset-categories';

import { Iconify } from 'src/components/iconify/iconify';

const isEmoji = (str?: string): boolean => {
  if (!str) return false;
  return /\p{Extended_Pictographic}/u.test(str);
};

// ----------------------------------------------------------------------

export const CategoryGrid: React.FC = () => {
  const router = useRouter();

  const { data: categories } = useGetAssetCategoriesTree();

  const handleSubCategoryClick = (subCategoryId: string) => {
    // 跳转到商品列表页面，并传递分类参数
    router.push(`${paths.rental.goods.root}?category=${subCategoryId}`);
  };

  return (
    <Box sx={{ p: 2, pb: 20 }}>
      {categories.map((category, categoryIndex) => (
        <Box
          key={category.id}
          id={`category-section-${categoryIndex}`}
          data-category-index={categoryIndex}
          sx={{
            mb: 4,
            scrollMarginTop: '80px', // 滚动偏移，与头部高度一致
          }}
        >
          {/* 分类标题 - 吸顶 */}
          <Box
            data-category-index={categoryIndex}
            sx={{
              position: 'sticky',
              top: 0, // CategoryHeader 的高度
              zIndex: 10,
              mb: 2,
              mt: categoryIndex === 0 ? 0 : -2, // 第一个标题不需要负 margin
              mx: -2, // 负 margin 扩展到全宽，抵消外层的 padding
              px: 2, // 恢复内容区域的 padding
              pt: 2,
              pb: 1.5,
              bgcolor: 'background.default',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {category.name}
            </Typography>
          </Box>
          <Box id={`category-title-${categoryIndex}`} />

          {/* 二级分类网格 */}
          <Grid container spacing={2}>
            {category.children?.map((subCategory, index) => (
              <Grid size={{ xs: 6, md: 4, lg: 3, xl: 2 }} key={subCategory.id}>
                <Paper
                  component={m.div}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubCategoryClick(subCategory.id)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: (theme) => theme.vars.customShadows.card,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: (theme) => theme.vars.customShadows.z8,
                    },
                  }}
                >
                  {isEmoji(subCategory.icon) ? (
                    <Typography
                      variant="h2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        color: 'primary.main',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {subCategory.icon}
                    </Typography>
                  ) : (
                    <Iconify
                      icon={subCategory.icon as IconifyName}
                      sx={{ width: 50, height: 50 }}
                    />
                  )}
                  {/* 图标 */}

                  {/* 文字 */}
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'center',
                    }}
                  >
                    {subCategory.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};
