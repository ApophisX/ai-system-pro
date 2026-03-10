import AMapLoader from '@amap/amap-jsapi-loader';
import { useRef, useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/global-config';

import { useSettingsContext } from 'src/components/settings';

type Props = {
  onLoaded?: () => void;
  containerId?: string;
  center?: [number, number];
};
export function useAmapAreaEditor({ onLoaded, containerId = 'amap' }: Props) {
  const mapRef = useRef<AMap.Map | null>(null);
  const polyEditorRef = useRef<any>(null);
  const isLoaded = useRef(false);

  const settings = useSettingsContext();

  const [state, setState] = useState({
    editing: false,
    polygons: [] as AMap.Polygon[],
    curTarget: null as AMap.Polygon | null,
  });

  // 创建多边形
  const createPolygon = useCallback(() => {
    setState((prev) => ({ ...prev, editing: true, curTarget: null }));
    polyEditorRef.current.close();
    polyEditorRef.current.setTarget();
    polyEditorRef.current.open();
  }, []);

  // 停止多边形
  const stopPolygon = useCallback(() => {
    setState((prev) => ({ ...prev, editing: false, curTarget: null }));
    polyEditorRef.current.close();
  }, []);

  // 删除多边形
  const deletePolygon = useCallback(() => {
    const currentPolygon = polyEditorRef.current.getTarget();
    mapRef.current?.remove(currentPolygon);
    setState((prev) => ({ ...prev, polygons: prev.polygons.filter((p) => p !== currentPolygon) }));
    createPolygon();
  }, [createPolygon]);

  const loadMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.destroy();
    }
    AMapLoader.load({
      key: CONFIG.amapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.Scale', 'AMap.PolygonEditor'], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['AMap.Scale','...','...']
      AMapUI: {
        //是否加载 AMapUI，缺省不加载
        version: '1.1', //AMapUI 版本
        plugins: ['overlay/SimpleMarker'], //需要加载的 AMapUI ui 插件
      },
      Loca: {
        //是否加载 Loca， 缺省不加载
        version: '2.0', //Loca 版本
      },
    })
      .then((amap: typeof AMap) => {
        isLoaded.current = true;
        mapRef.current = new amap.Map(containerId, {
          center: [120.619721, 31.314093],
          zoom: 17,
          mapStyle: settings.state.mode === 'dark' ? 'amap://styles/grey' : undefined,
        });
        // @ts-expect-error - PolygonEditor type definition may not be available in AMap types
        polyEditorRef.current = new amap.PolygonEditor(mapRef.current);
        polyEditorRef.current.on('add', (e: any) => {
          const polygon = e.target as AMap.Polygon;
          polyEditorRef.current.addAdsorbPolygons(polygon);
          setState((prev) => ({ ...prev, polygons: [...prev.polygons, polygon] }));
          polygon.on('dblclick', () => {
            polyEditorRef.current.setTarget(polygon);
            polyEditorRef.current.open();
            setState((prev) => ({ ...prev, editing: true, curTarget: polygon }));
          });
          setTimeout(createPolygon, 300);
        });
        onLoaded?.();
      })
      .catch((e) => {
        console.log(e);
        isLoaded.current = false;
      });
  }, [containerId, createPolygon, onLoaded, settings.state.mode]);

  useEffect(() => {
    if (isLoaded.current) return;
    loadMap();
  }, [loadMap]);

  const getAreaPaths = useCallback(() => {
    const pathList = state.polygons.map((p) => {
      const path = p.getPath().map((po: any) => [po.lng, po.lat]);
      return path;
    });
    return pathList;
  }, [state.polygons]);

  const memoizedValue = {
    state,
    setState,
    mapRef,
    getAreaPaths,
    polyEditorRef,
    createPolygon,
    stopPolygon,
    deletePolygon,
  };
  return memoizedValue;
}

export function useAmap({
  onLoaded,
  containerId = 'amap',
  center = [120.619721, 31.314093],
}: Props) {
  const mapRef = useRef<AMap.Map | null>(null);
  const isLoaded = useRef(false);
  const isLoading = useRef(false);

  const settings = useSettingsContext();

  const loadMap = useCallback(
    (): Promise<AMap.Map> =>
      new Promise((resolve, reject) => {
        if (isLoading.current) return;
        isLoading.current = true;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
        AMapLoader.load({
          key: CONFIG.amapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
          version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: ['AMap.Scale', 'AMap.PolygonEditor'], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['AMap.Scale','...','...']
          AMapUI: {
            //是否加载 AMapUI，缺省不加载
            version: '1.1', //AMapUI 版本
            plugins: ['overlay/SimpleMarker'], //需要加载的 AMapUI ui 插件
          },
          Loca: {
            //是否加载 Loca， 缺省不加载
            version: '2.0', //Loca 版本
          },
        })
          .then((amap: typeof AMap) => {
            isLoaded.current = true;
            mapRef.current = new amap.Map(containerId, {
              center,
              zoom: 17,
              mapStyle: settings.state.mode === 'dark' ? 'amap://styles/grey' : undefined,
            });
            onLoaded?.();
            resolve(mapRef.current);
          })
          .catch((e) => {
            console.log(e);
            isLoaded.current = false;
            reject(e);
          })
          .finally(() => {
            isLoading.current = false;
          });
      }),
    [center, containerId, onLoaded, settings.state.mode]
  );

  useEffect(() => {
    if (isLoaded.current) return;
    loadMap();
  }, [loadMap]);

  return {
    mapRef,
    loadMap,
  };
}
