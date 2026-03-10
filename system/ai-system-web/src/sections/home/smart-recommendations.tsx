import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Flashlight, CircleDollarSign } from 'lucide-react';

import { Box, Grid, Card, Avatar, CardMedia, Typography, CardContent, Stack } from '@mui/material';

// 1. 定义数据类型
interface RecommendItem {
  id: string;
  title: string;
  price: number;
  unit: string;
  distance: string;
  image: string;
  tag: string;
  rating: number;
  ownerAvatar: string;
}

// 2. 模拟数据（实际开发中通过 API 获取）
const MOCK_DATA: Record<string, RecommendItem[]> = {
  nearby: [
    {
      id: '1',
      title: '大疆 DJI Mavic 3 无人机',
      price: 199,
      unit: '天',
      distance: '800m',
      tag: '芝麻免押',
      rating: 4.9,
      ownerAvatar: 'https://i.pravatar.cc/100?img=1',
      image: 'https://images.unsplash.com/photo-1473960104509-493e97eb331e?w=400&q=80',
    },
    {
      id: '2',
      title: '九号电动车 F90 顶配版',
      price: 45,
      unit: '天',
      distance: '1.2km',
      tag: '准新车',
      rating: 4.8,
      ownerAvatar: 'https://i.pravatar.cc/100?img=2',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80',
    },
  ],
  today: [
    {
      id: '3',
      title: '索尼 A7M4 微单镜头套装',
      price: 299,
      unit: '天',
      distance: '3.5km',
      tag: '今日可用',
      rating: 5.0,
      ownerAvatar: 'https://i.pravatar.cc/100?img=3',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    },
    {
      id: '4',
      title: '露营全家桶（含帐篷天幕）',
      price: 120,
      unit: '次',
      distance: '2.1km',
      tag: '已消毒',
      rating: 4.7,
      ownerAvatar: 'https://i.pravatar.cc/100?img=4',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
    },
  ],
  budget: [
    {
      id: '5',
      title: '得力电钻工具箱 32件套',
      price: 15,
      unit: '天',
      distance: '500m',
      tag: '价格友好',
      rating: 4.6,
      ownerAvatar: 'https://i.pravatar.cc/100?img=5',
      image: 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d6?w=400&q=80',
    },
  ],
};

const tabs = [
  { id: 'nearby', label: '附近可租', icon: <MapPin size={16} /> },
  { id: 'today', label: '今日可用', icon: <Flashlight size={16} /> },
  { id: 'budget', label: '价格友好', icon: <CircleDollarSign size={16} /> },
];

export const SmartRecommendations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nearby');

  return (
    <Box sx={{ mt: 4 }}>
      {/* 智能 Tab 切换栏 */}
      <Stack
        direction="row"
        flexWrap="nowrap"
        sx={{
          overflowX: 'auto',
          gap: 1,
          mb: 3,
          position: 'sticky',
          top: 56,
          zIndex: 10,
          p: 0.5,
          borderRadius: 10,
          bgcolor: (theme) => theme.vars.palette.background.paper,
          boxShadow: (theme) => theme.vars.customShadows.z8,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                position: 'relative',
                flexShrink: 0,
                px: 2,
                py: 1,
                minWidth: 100,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                borderRadius: 3,
                transition: 'color 0.3s',
                color: isActive ? '#fff' : (theme) => theme.vars.palette.grey[600],
                zIndex: 1,
              }}
            >
              {tab.icon}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {tab.label}
              </Typography>

              {isActive && (
                <Box
                  component={m.div}
                  layoutId="active-pill"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'primary.main',
                    borderRadius: 3,
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Box>
          );
        })}
      </Stack>

      {/* 推荐内容网格 */}
      <Grid container spacing={2}>
        <AnimatePresence mode="popLayout">
          {MOCK_DATA[activeTab].map((item, index) => (
            <Grid
              size={{ xs: 6 }}
              key={item.id}
              component={m.div}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: (theme) => theme.vars.customShadows.z8,
                  position: 'relative',
                }}
              >
                {/* 图片区 */}
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="160" image={item.image} alt={item.title} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      px: 1,
                      borderRadius: 1,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#2563eb' }}>
                      {item.tag}
                    </Typography>
                  </Box>
                </Box>

                {/* 内容区 */}
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {item.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Star size={12} fill="#ffb400" color="#ffb400" />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {item.rating}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', ml: 'auto' }}>
                      {item.distance}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 800, fontSize: '1.1rem' }}
                      >
                        ¥{item.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /{item.unit}
                      </Typography>
                    </Box>
                    <Avatar src={item.ownerAvatar} sx={{ width: 20, height: 20 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </Box>
  );
};
