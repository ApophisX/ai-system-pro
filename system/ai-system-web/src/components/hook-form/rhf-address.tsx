import type { DrawerProps } from '@mui/material';
import type { DialogProps } from '@toolpad/core/useDialogs';

import axios from 'axios';
import { debounce } from 'es-toolkit';
import { useFormContext } from 'react-hook-form';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

import {
  Box,
  Stack,
  Button,
  Drawer,
  Divider,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';

import { CONFIG } from 'src/global-config';

import { Iconify } from '../iconify';
import { useGetArea } from './rhf-area';
import { useAmap } from '../custom/amap/use-amap';

type Props = {
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  onConfirm?: (state: IAddress) => void;
};
export function RHFAddress(props: Props) {
  const { readOnly = false, onConfirm, required = true, name = 'address' } = props;

  const { open: openDialog } = useDialogs();
  useGetArea();

  const {
    watch,
    setValue,
    clearErrors,

    formState: { errors },
  } = useFormContext();
  const watchNameValue = watch(name) || {};
  const { province, city, district, address, longitude, latitude, addressName } = watchNameValue;

  const isError = required ? !!errors[name] : false;

  const displayText = `${province?.label ?? ''}${city?.label ?? ''}${district?.label ?? ''}`;

  // 打开地址选择抽屉
  const handleClick = useCallback(() => {
    const payload = {
      province,
      city,
      district,
      address,
      lng: longitude,
      lat: latitude,
      addressName,
    };
    openDialog(
      AddressSelectDrawer,
      { value: payload, readOnly },
      {
        onClose: async (result) => {
          if (result) {
            setValue(name, {
              province: result.province,
              city: result.city,
              district: result.district,
              address: result.address,
              addressName: result.addressName,
              longitude: result.lng.toString(),
              latitude: result.lat.toString(),
            });
            clearErrors(name);
            onConfirm?.(result);
          }
        },
      }
    );
  }, [
    address,
    addressName,
    city,
    clearErrors,
    district,
    latitude,
    longitude,
    name,
    onConfirm,
    openDialog,
    province,
    readOnly,
    setValue,
  ]);

  return (
    <TextField
      placeholder="请选择"
      label="选择地址"
      value={displayText}
      error={required && isError}
      helperText={required && isError ? '请选择地址' : undefined}
      fullWidth
      slotProps={{
        input: {
          readOnly: true,
          inputProps: {
            onClick: handleClick,
          },
          endAdornment: (
            <InputAdornment position="end">
              <Stack direction="row" alignItems="center">
                {readOnly || !displayText ? undefined : (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue(name, {});
                      setValue('address.addressName', '');
                      clearErrors(name);
                    }}
                    edge="end"
                    size="small"
                  >
                    <Iconify icon="mingcute:close-line" />
                  </IconButton>
                )}
                {!displayText && !readOnly && (
                  <Stack direction="row" alignItems="center" onClick={handleClick}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      请选择
                    </Typography>
                    <Iconify icon="eva:arrow-ios-forward-fill" />
                  </Stack>
                )}
              </Stack>
            </InputAdornment>
          ),
        },
        inputLabel: { shrink: true },
      }}
    />
  );
}

type IAddress = {
  province?: { value: string; label: string };
  city?: { value: string; label: string };
  district?: { value: string; label: string };
  lng: number;
  lat: number;
  address: string;
  addressName: string;
};

type AddressSearchTip = {
  name: string;
  province: string;
  city: string;
  district: string;
  adcode: string;
  location: string; // 格式: "经度,纬度"
  address: string;
};

type AddressSelectDrawerProps = DrawerProps & {
  value?: IAddress;
  readOnly?: boolean;
};

function AddressSelectDrawer({
  open,
  payload,
  onClose,
}: DialogProps<AddressSelectDrawerProps, IAddress | null>) {
  const { value, readOnly = false, ...props } = payload;
  const { mapRef } = useAmap({
    center: value?.lng && value?.lat ? [value.lng, value.lat] : undefined,
    containerId: 'addressSelectAmap',
    onLoaded: () => {
      // handleSelectAddressByClick();
      handleSelectAddressByMove();
    },
  });

  const areaDataRef = useRef({
    provinceOptions: [] as { value: string; label: string }[],
    cityOptions: [] as { value: string; label: string }[],
    districtOptions: [] as { value: string; label: string }[],
  });

  const areaData = useGetArea();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [state, setState] = useState<IAddress | undefined>(value);
  const [searchInput, setSearchInput] = useState('');
  const [searchOptions, setSearchOptions] = useState<AddressSearchTip[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const setStateRef = useRef(true);

  const areaText = useMemo(() => {
    const text = `${state?.address ?? ''}`;
    return text || '请选择地址';
  }, [state]);

  // 通过adcode获取地址数据
  const getAreaDataByAdcode = useCallback((adcode: string) => {
    const { provinceOptions, cityOptions, districtOptions } = areaDataRef.current;

    const provincePrefixCode = adcode.slice(0, 2);
    const cityPrefixCode = adcode.slice(0, 4);
    const districtPrefixCode = adcode.slice(0, 6);

    const province = provinceOptions.find((item) => item.value.startsWith(provincePrefixCode));
    const city = cityOptions.find((item) => item.value.startsWith(cityPrefixCode));
    const district = districtOptions.find((item) => item.value.startsWith(districtPrefixCode));
    return {
      province,
      city,
      district,
    };
  }, []);

  // 通过经纬度获取地址
  const getAddressByLngLat = useCallback(
    async (lng: number, lat: number) => {
      const res = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
        params: {
          location: `${lng},${lat}`,
          key: CONFIG.amapWebServerKey,
        },
      });
      const {
        addressComponent: { adcode },
        formatted_address: address,
      } = res.data.regeocode || {};

      const { province, city, district } = getAreaDataByAdcode(adcode);

      const addressName = stripAdminPrefix(address);

      if (!setStateRef.current) return false;

      setState((pre) => ({
        province,
        city,
        district,
        lng,
        lat,
        address,
        addressName,
      }));
      return true;
    },
    [getAreaDataByAdcode]
  );

  // 搜索地址
  const searchAddress = useCallback(async (keywords: string) => {
    if (!keywords.trim()) {
      setSearchOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await axios.get('https://restapi.amap.com/v5/place/text', {
        params: {
          key: CONFIG.amapWebServerKey,
          keywords,
        },
      });
      if (res.data?.pois?.length > 0) {
        const options = res.data.pois.map((poi: any) => ({
          name: poi.name,
          adcode: poi.adcode,
          province: poi.pname,
          city: poi.cityname,
          district: poi.adname,
          address: poi.address,
          location: poi.location,
        }));
        setSearchOptions(options);
      } else {
        setSearchOptions([]);
      }
    } catch (error) {
      console.error('搜索地址失败:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce((keywords: string) => searchAddress(keywords), 1500),
    [searchAddress]
  );

  // 添加地图标记
  const addMarker = useCallback((lng: number, lat: number) => {
    const icon = new AMap.Icon({
      size: new AMap.Size(32, 32),
      image: '/assets/icons/global/icon-location.png',
      imageSize: new AMap.Size(32, 32),
    });

    const marker = new AMap.Marker({
      icon,
      position: [lng, lat],
      anchor: 'bottom-center',
    });
    return marker;
  }, []);

  // 处理选择搜索结果
  const handleSelectSearchResult = useCallback(
    async (tip: AddressSearchTip | null) => {
      if (!tip || !tip.location) return;

      const [lng, lat] = tip.location.split(',').map(Number);

      setStateRef.current = false;
      // 更新地图中心
      mapRef.current?.setZoomAndCenter(20, new AMap.LngLat(lng, lat));
      mapRef.current?.clearMap();
      // addMarker(lng, lat).setMap(mapRef.current);

      // 清空搜索
      setSearchInput('');
      setSearchOptions([]);

      const { adcode } = tip;
      const { province, city, district } = getAreaDataByAdcode(adcode);

      setState((pre) => ({
        province,
        city,
        district,
        lng,
        lat,
        address: `${tip.province}${tip.city}${tip.district}${tip.address}`,
        addressName: tip.name,
      }));
    },
    [getAreaDataByAdcode, mapRef]
  );

  //  通过地图移动来获取地址
  const handleSelectAddressByMove = useCallback(() => {
    if (mapRef.current) {
      const handleMoveend = async () => {
        const center = mapRef.current?.getCenter();
        if (center) {
          const lng = center.getLng();
          const lat = center.getLat();
          await getAddressByLngLat(lng, lat);
          setStateRef.current = true;
        }
      };

      mapRef.current.on('moveend', handleMoveend);
      if (!value?.lng || value?.lat) {
        handleMoveend();
      }
    }
  }, [getAddressByLngLat, mapRef, value?.lat, value?.lng]);

  // 通过点击地图选择地址
  const handleSelectAddressByClick = useCallback(() => {
    if (value?.lng && value?.lat) {
      mapRef.current?.setCenter(new AMap.LngLat(value.lng, value.lat));
      addMarker(value.lng, value.lat).setMap(mapRef.current);
    }

    if (readOnly) return;

    mapRef.current?.on('click', (e) => {
      const { lat, lng } = e.lnglat;
      mapRef.current?.clearMap();
      getAddressByLngLat(lng, lat);
      addMarker(lng, lat).setMap(mapRef.current);
    });
  }, [addMarker, getAddressByLngLat, mapRef, readOnly, value?.lat, value?.lng]);

  // 关闭抽屉
  const handleClose = useCallback(() => {
    onClose(null);
  }, [onClose]);

  // 当搜索输入变化时触发搜索
  useEffect(() => {
    setSearchLoading(!!searchInput);
    debouncedSearch(searchInput);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    if (areaData) {
      areaDataRef.current = {
        provinceOptions: areaData.provinceOptions,
        cityOptions: areaData.cityOptions,
        districtOptions: areaData.districtOptions,
      };
    }
  }, [areaData]);

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      sx={{ userSelect: 'none', zIndex: (t) => t.zIndex.modal + 1 }}
      open={open}
      onClose={handleClose}
      {...props}
    >
      <Stack
        sx={{
          ...(isMobile ? { height: '90vh' } : { width: '80vw', height: '100%' }),
        }}
      >
        <Stack
          direction="row"
          sx={{ px: 2, py: 2 }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{readOnly ? '查看地址' : '选择地址'}</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
        <Divider />

        <Box flex={1} position="relative">
          <Box id="addressSelectAmap" sx={{ height: '100%', width: '100%' }} />
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1, p: 2 }}>
            <Autocomplete
              options={searchOptions}
              loading={searchLoading}
              inputValue={searchInput}
              onInputChange={(_, newInputValue) => {
                setSearchInput(newInputValue);
              }}
              onChange={(_, newValue) => {
                handleSelectSearchResult(newValue);
              }}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, selectedValue) =>
                option.location === selectedValue.location
              }
              filterOptions={(options) => options}
              renderOption={(optionProps, option) => (
                <Box component="li" {...optionProps}>
                  <Stack spacing={0.5} sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {option.province}
                      {option.city}
                      {option.district}
                      {option.address}
                    </Typography>
                  </Stack>
                </Box>
              )}
              fullWidth
              loadingText="搜索中..."
              noOptionsText={searchInput ? '未找到相关地址' : '请输入地址关键词搜索'}
              slotProps={{ popper: { sx: { zIndex: 9999999 } } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="搜索地址"
                  margin="none"
                  slotProps={{
                    input: {
                      sx: {
                        backgroundColor: 'background.paper',
                      },
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" />
                        </InputAdornment>
                      ),
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              )}
            />
          </Box>
          <CenterMarker />
          <AddressText areaText={areaText} />
        </Box>
        <Divider />
        {!readOnly && (
          <Stack direction="row" spacing={3} px={2} pb={4} pt={2}>
            <Button variant="soft" size="large" fullWidth onClick={handleClose}>
              取消
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              color="primary"
              disabled={
                !state || !state?.address || !state?.province || !state?.city || !state?.district
              }
              onClick={() => {
                if (state) {
                  onClose(state);
                }
              }}
            >
              确定
            </Button>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}

function AddressText({ areaText }: { areaText: string }) {
  return (
    <Box
      position="absolute"
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        p: 2,
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: 1,
      }}
    >
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Typography variant="body2" sx={{ color: 'common.white' }}>
          {areaText}
        </Typography>
      </Stack>
    </Box>
  );
}

function CenterMarker() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}
    >
      <Iconify icon="custom:location-fill" width={32} height={32} sx={{ color: 'primary.main' }} />
    </Box>
  );
}

function stripAdminPrefix(address: string): string {
  if (!address) return address;

  let result = address;

  // 1. 去省 / 自治区 / 特别行政区
  result = result.replace(/^(.*?(省|自治区|特别行政区))/, '');

  // 2. 去第一个“市”（地级市）
  result = result.replace(/^(.*?市)/, '');

  // 3. 去紧接着的 区 / 县 / 县级市
  result = result.replace(/^(.*?(区|县|市))/, '');

  return result.trim();
}
