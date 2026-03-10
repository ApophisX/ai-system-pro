import type { DialogProps } from '@toolpad/core/useDialogs';
import type { StackProps, DrawerProps } from '@mui/material';

import useSWR from 'swr';
import axios from 'axios';
import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Tab,
  Tabs,
  List,
  Stack,
  Drawer,
  Button,
  ListItem,
  ListItemText,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

function useGetArea(assetUrl = CONFIG.areaJsonUrl) {
  const { data, isLoading, isValidating } = useSWR(
    assetUrl,
    (url) => axios.get<IAddressData>(url),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(() => {
    const { province_list = {}, city_list = {}, district_list = {} } = data?.data || {};
    return {
      data: data?.data,
      province_list,
      city_list,
      district_list,
      provinceOptions: Object.entries(province_list).map(([key, value]) => ({
        label: value,
        value: key,
      })),
      cityOptions: Object.entries(city_list).map(([key, value]) => ({
        label: value,
        value: key,
      })),
      districtOptions: Object.entries(district_list).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    };
  }, [data?.data]);

  return memoizedValue;
}

type IAddressData = {
  province_list: Record<string, string>;
  city_list: Record<string, string>;
  district_list: Record<string, string>;
};

const convertToList = (rawMap?: Record<string, string>) => {
  if (!rawMap) return [];
  return Object.entries(rawMap).map(([key, label]) => ({ value: key, label }));
};

type IAddressOption = {
  label: string;
  value: string;
};

type IAddressCheckedState = {
  province: IAddressOption | null;
  city: IAddressOption | null;
  district: IAddressOption | null;
};

type IAddressOptions = {
  [key in keyof IAddressCheckedState]: IAddressOption[];
};

type Props = {
  values: IAddressCheckedState;
  slotProps?: {
    containerProps?: StackProps;
    drawerProps?: DrawerProps;
  };
};

export function AddressSelectDrawer(props: DialogProps<Props, IAddressCheckedState | null>) {
  const { open, payload, onClose } = props;
  const { values, slotProps } = payload;
  const { containerProps = {}, drawerProps = {} } = slotProps || {};
  const data = useGetArea();

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [state, setState] = useState<{
    data: IAddressCheckedState;
    checkedTab: keyof IAddressCheckedState;
  }>({
    checkedTab: 'province',
    data: values,
  });

  const handleClose = useCallback(() => {
    onClose(null);
  }, [onClose]);

  const optionList: IAddressOptions = useMemo(
    () => ({
      province: convertToList(data?.province_list),
      city: convertToList(data?.city_list),
      district: convertToList(data?.district_list),
    }),
    [data]
  );

  const currentOptions = useMemo(() => {
    if (state.checkedTab === 'city' && state.data.province) {
      return optionList.city.filter((item) =>
        item.value.startsWith(state.data.province!.value.slice(0, 2))
      );
    }
    if (state.checkedTab === 'district' && state.data.city) {
      return optionList.district.filter((item) =>
        item.value.startsWith(state.data.city!.value.slice(0, 4))
      );
    }
    return optionList.province;
  }, [
    optionList.city,
    optionList.district,
    optionList.province,
    state.checkedTab,
    state.data.city,
    state.data.province,
  ]);

  useEffect(() => {
    if (open) {
      let checkedTab: keyof IAddressCheckedState = 'province';
      if (values.city) {
        checkedTab = 'district';
      } else if (values.province) {
        checkedTab = 'city';
      }
      setState((pre) => ({
        checkedTab,
        data: values,
      }));
    }
  }, [values, open]);

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : drawerProps?.anchor || 'right'}
      sx={{ userSelect: 'none', zIndex: (t) => t.zIndex.modal + 1 }}
      {...drawerProps}
      open={open}
      onClose={handleClose}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={!state.data.province && !state.data.city && !state.data.district}
            onClick={() => {
              onClose({ province: null, city: null, district: null });
            }}
          >
            <ListItemText primary="全国" />
          </ListItemButton>
        </ListItem>
      </List>
      <Stack
        {...containerProps}
        sx={
          drawerProps?.anchor === 'bottom' || isMobile
            ? { height: '70vh' }
            : { width: 450, height: '100%' }
        }
      >
        <Tabs
          value={state.checkedTab}
          sx={{ px: 2 }}
          onChange={(_, value) => setState((pre) => ({ ...pre, checkedTab: value }))}
        >
          <Tab
            value="province"
            label={state.data.province ? state.data.province.label : '请选择'}
          />
          {state.data.province && (
            <Tab value="city" label={state.data.city ? state.data.city.label : '请选择'} />
          )}
          {state.data.city && (
            <Tab
              value="district"
              label={state.data.district ? state.data.district.label : '请选择'}
            />
          )}
        </Tabs>
        <Scrollbar>
          <List>
            {currentOptions.map((item) => {
              const isSelected = state.data[state.checkedTab]?.value === item.value;
              return (
                <ListItem
                  disablePadding
                  key={item.value}
                  secondaryAction={isSelected && <Iconify icon="eva:checkmark-fill" />}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      setState((pre) => {
                        let currentTab: keyof IAddressCheckedState = 'province';
                        const checkedData: IAddressCheckedState = {
                          ...pre.data,
                        };
                        checkedData[pre.checkedTab] = item;
                        if (pre.checkedTab === 'province') {
                          currentTab = 'city';
                          checkedData.city = null;
                          checkedData.district = null;
                        } else if (pre.checkedTab === 'city') {
                          currentTab = 'district';
                          checkedData.district = null;
                        } else {
                          currentTab = 'district';
                        }
                        return {
                          checkedTab: currentTab,
                          data: { ...checkedData },
                        };
                      });
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Scrollbar>
        <Stack direction="row" spacing={3} px={2} pb={4} pt={2}>
          <Button
            variant="soft"
            size="large"
            fullWidth
            onClick={() => {
              handleClose();
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            size="large"
            color="primary"
            fullWidth
            disabled={!state.data.province && !state.data.city && !state.data.district}
            onClick={() => {
              onClose(state.data);
            }}
          >
            确定
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
