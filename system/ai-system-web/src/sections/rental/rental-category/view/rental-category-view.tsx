import { debounce, throttle } from 'lodash';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Stack } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import { BottomNav } from 'src/sections/home/bottom-nav';

import { CategoryGrid } from '../category-grid';
import { categories } from '../data/categories';
import { CategoryHeader } from '../category-header';
import { CategorySidebar } from '../category-sidebar';

// ----------------------------------------------------------------------

const HEADER_BAR_HEIGHT = 56;

export const RentalCategoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1); // 默认选中分类tab
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // 处理左侧分类点击，滚动到对应位置
  const handleCategoryChange = useCallback((index: number) => {
    isScrollingRef.current = true;
    setActiveCategory(index);

    // 滚动到标题位置，标题会自动吸顶
    const titleElement = document.getElementById(`category-title-${index}`);
    if (titleElement && scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const titleRect = titleElement.getBoundingClientRect();
      const scrollTop = scrollContainerRef.current.scrollTop;
      scrollContainerRef.current.scrollTo({
        top: scrollTop + titleRect.top - containerRect.top - HEADER_BAR_HEIGHT,
        behavior: 'smooth',
      });
    }
  }, []);

  // 使用 Intersection Observer 监听滚动，自动切换选中分类
  useEffect(() => {
    if (!scrollContainerRef.current) return () => {};

    const setScrollingFalse = debounce(() => {
      isScrollingRef.current = false;
    }, 100);

    // 使用滚动事件配合 IntersectionObserver 来准确判断哪个标题在顶部
    const handleScroll = throttle(() => {
      if (isScrollingRef.current) {
        setScrollingFalse();
        return;
      }

      const container = scrollContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const headerOffset = HEADER_BAR_HEIGHT; // CategoryHeader 的高度
      const targetTop = containerRect.top + headerOffset;

      // 找到所有标题元素
      interface TitleItem {
        index: number;
        element: HTMLElement;
      }
      const titles: TitleItem[] = [];
      categories.forEach((_, index) => {
        const element = document.getElementById(`category-title-${index}`);
        if (element) {
          titles.push({ index, element });
        }
      });

      // 找到最接近顶部或已经吸顶的标题
      interface TitleMatch {
        index: number;
        distance: number;
      }
      let activeIndex = 0;
      let bestMatch: TitleMatch | undefined;

      titles.forEach((titleItem: TitleItem) => {
        const { index, element } = titleItem;
        const rect = element.getBoundingClientRect();
        const distance = rect.top - targetTop;

        // 如果标题已经在顶部或以下（已经吸顶或滚动过），优先选择
        if (distance <= 0) {
          // 选择距离顶部最近的那个（通常是已经吸顶的）
          if (!bestMatch || distance > bestMatch.distance) {
            bestMatch = { index, distance };
          }
        }
      });

      // 如果找到了在顶部或以下的标题，使用它
      if (bestMatch) {
        activeIndex = bestMatch.index;
      } else {
        // 如果所有标题都还在顶部上方，选择最接近顶部的一个
        let closestMatch: TitleMatch | undefined;
        titles.forEach((titleItem: TitleItem) => {
          const { index, element } = titleItem;
          const rect = element.getBoundingClientRect();
          const distance = rect.top - targetTop;
          if (!closestMatch || distance < closestMatch.distance) {
            closestMatch = { index, distance };
          }
        });
        if (closestMatch) {
          activeIndex = closestMatch.index;
        }
      }
      setActiveCategory(activeIndex);
      setScrollingFalse();
    }, 50); // 节流，避免频繁触发

    const handleScrollEnd = () => {
      isScrollingRef.current = false;
    };

    const container = scrollContainerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });

    // 添加滚动结束事件
    container.addEventListener('scrollend', handleScrollEnd);

    // 初始检查
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
    };
  }, []);

  // 当 activeCategory 改变时，自动滚动左侧菜单使选中项可见
  useEffect(() => {
    if (!sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    const menuItems = sidebar.children;
    const activeItem = menuItems[activeCategory] as HTMLElement;

    if (!activeItem) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    // 检查菜单项是否在可视区域内
    const isVisible = itemRect.top >= sidebarRect.top && itemRect.bottom <= sidebarRect.bottom;

    // 如果不在可视区域内，滚动使其可见
    if (!isVisible) {
      // 如果菜单项在底部下方，滚动到底部
      if (itemRect.bottom > sidebarRect.bottom) {
        sidebar.scrollTo({
          top: activeItem.offsetTop - sidebar.clientHeight + activeItem.clientHeight,
          behavior: 'smooth',
        });
      }
      // 如果菜单项在顶部上方，滚动到顶部
      else if (itemRect.top < sidebarRect.top) {
        sidebar.scrollTo({
          top: activeItem.offsetTop - 56 - 90 * 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeCategory]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* 吸顶头部 */}
      <CategoryHeader />

      <Stack direction="row" sx={{ flex: 1, overflow: 'hidden', paddingBottom: '86px' }}>
        {/* 左侧一级分类 - 固定 */}
        <CategorySidebar
          ref={sidebarRef}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* 右侧二级分类网格 - 可滚动 */}
        <Scrollbar fillContent ref={scrollContainerRef}>
          <CategoryGrid />
        </Scrollbar>
      </Stack>

      {/* 固定底部导航 */}
      <BottomNav />
    </Box>
  );
};
