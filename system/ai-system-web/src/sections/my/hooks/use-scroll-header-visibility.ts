import type { RefObject } from 'react';

import { useState, useEffect, useRef } from 'react';

// ----------------------------------------------------------------------

export function useScrollHeaderVisibility(
  headerRef: RefObject<HTMLElement | null>,
  containerRef?: RefObject<any>
) {
  const [shouldShowAppBar, setShouldShowAppBar] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const isHeaderVisibleRef = useRef(true);

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!headerRef.current) return () => {};

    const headerElement = headerRef.current;

    // 获取滚动容器：如果是 SimpleBar，需要找到 .simplebar-content-wrapper
    const getScrollContainer = (): HTMLElement | null => {
      if (!containerRef?.current) return null;

      const container = containerRef.current;

      // SimpleBar 的 scrollableNode 的父元素就是 .simplebar-content-wrapper
      if (container.parentElement) {
        // 直接查找最近的 .simplebar-content-wrapper
        let parent: HTMLElement | null = container.parentElement as HTMLElement;
        while (parent && parent !== document.body) {
          if (parent.classList.contains('simplebar-content-wrapper')) {
            return parent;
          }
          parent = parent.parentElement as HTMLElement | null;
        }
      }

      // 如果找不到，尝试通过 document 查找
      const scrollWrapper = document.querySelector('.simplebar-content-wrapper') as HTMLElement;
      if (scrollWrapper && scrollWrapper.contains(container)) {
        return scrollWrapper;
      }

      // 如果都不是，返回 container 本身（假设它是可滚动的）
      return container as HTMLElement;
    };

    // 使用 setTimeout 确保 SimpleBar 已经初始化
    const timeoutId = setTimeout(() => {
      const scrollContainer = getScrollContainer();

      // 使用 Intersection Observer 检测 header 可见性
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const visible = entry.isIntersecting;
          isHeaderVisibleRef.current = visible;

          // 当 header 可见时，不显示 AppBar
          if (visible) {
            setShouldShowAppBar(false);
          }
        },
        {
          root: scrollContainer || null,
          threshold: 0,
          rootMargin: '0px',
        }
      );

      observer.observe(headerElement);

      // 检测滚动方向并控制 AppBar 显示
      const handleScroll = () => {
        const currentScrollY = scrollContainer
          ? scrollContainer.scrollTop
          : window.scrollY || document.documentElement.scrollTop;

        // 检测滚动方向（需要有一定的滚动距离才改变方向）
        const scrollDelta = currentScrollY - lastScrollY.current;
        if (Math.abs(scrollDelta) > 5) {
          if (scrollDelta > 0) {
            scrollDirection.current = 'down';
          } else {
            scrollDirection.current = 'up';
          }
        }
        lastScrollY.current = currentScrollY;

        // 当 header 不可见时，根据滚动方向显示/隐藏 AppBar
        if (!isHeaderVisibleRef.current) {
          setShouldShowAppBar(scrollDirection.current === 'down');
        }
      };

      // 监听滚动事件
      const target = scrollContainer || window;
      target.addEventListener('scroll', handleScroll, { passive: true });

      // 初始检查 header 可见性
      const rect = headerElement.getBoundingClientRect();
      const containerRect = scrollContainer?.getBoundingClientRect();
      const visible = scrollContainer ? rect.bottom > (containerRect?.top || 0) : rect.bottom > 0;
      isHeaderVisibleRef.current = visible;
      if (visible) {
        setShouldShowAppBar(false);
      }

      // 保存清理函数
      cleanupRef.current = () => {
        observer.disconnect();
        target.removeEventListener('scroll', handleScroll);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [headerRef, containerRef]);

  return { shouldShowAppBar };
}
