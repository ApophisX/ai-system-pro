import type { StackProps, DrawerProps } from '@mui/material';

import useSWR from 'swr';
import axios from 'axios';
import { useFormContext } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect } from 'react';

import {
  Tab,
  List,
  Tabs,
  Stack,
  Button,
  Drawer,
  ListItem,
  TextField,
  IconButton,
  ListItemText,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';

import { CONFIG } from 'src/global-config';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';

type IAddressData = {
  province_list: Record<string, string>;
  city_list: Record<string, string>;
  district_list: Record<string, string>;
};

export function useGetArea(assetUrl = CONFIG.areaJsonUrl) {
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

type Props = {
  readOnly?: boolean;
  drawerProps?: DrawerProps;
  required?: boolean;
};
export function RHFArea({ readOnly = false, drawerProps, required }: Props) {
  const {
    setValue,
    clearErrors,
    formState: { errors },
    watch,
  } = useFormContext();

  const openDrawer = useBoolean();

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const values = watch();

  const address = useMemo(
    () =>
      (values.province?.label || '') + (values.city?.label || '') + (values.district?.label || ''),
    [values.city?.label, values.district?.label, values.province?.label]
  );

  const isAreaError = useMemo(
    () => (required ? !!(errors.province || errors.city || errors.district) : false),
    [required, errors.province, errors.city, errors.district]
  );

  return (
    <>
      <TextField
        placeholder="选择地区"
        label="地区"
        value={address}
        error={isAreaError}
        helperText={isAreaError ? '请选择地区' : undefined}
        fullWidth
        disabled={readOnly}
        slotProps={{
          input: {
            readOnly: true,
            inputProps: {
              onClick: readOnly ? undefined : openDrawer.onTrue,
            },
            endAdornment:
              readOnly || !address ? undefined : (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue('province', undefined);
                    setValue('city', undefined);
                    setValue('district', undefined);
                  }}
                  edge="end"
                  size="small"
                >
                  <Iconify icon="mingcute:close-line" />
                </IconButton>
              ),
          },
          inputLabel: { shrink: true },
        }}
      />
      <AddressSelectDrawer
        {...drawerProps}
        containerProps={{
          sx:
            drawerProps?.anchor === 'bottom' || isMobile
              ? { height: '70vh' }
              : { width: 450, height: '100%' },
        }}
        anchor={isMobile ? 'bottom' : drawerProps?.anchor || 'right'}
        // anchor={formValues?.id ? 'right' : 'bottom'}
        // variant={formValues?.id ? 'persistent' : 'temporary'}

        values={{
          province: values.province,
          city: values.city,
          district: values.district,
        }}
        open={openDrawer.value}
        onClose={openDrawer.onFalse}
        onConfirm={(state) => {
          setValue('province', state.province);
          setValue('city', state.city);
          setValue('district', state.district);
          clearErrors(['province', 'city', 'district']);
        }}
      />
    </>
  );
}

const convertToList = (rawMap?: Record<string, string>) => {
  if (!rawMap) return [];
  return Object.entries(rawMap).map(([key, label]) => ({ value: key, label }));
};

type IAddressCheckedState = {
  province: { value: string; label: string } | null;
  city: { value: string; label: string } | null;
  district: { value: string; label: string } | null;
};

type IAddressOptions = {
  [key in keyof IAddressCheckedState]: { value: string; label: string }[];
};

function AddressSelectDrawer({
  onConfirm,
  values,
  containerProps,
  ...props
}: DrawerProps & {
  onConfirm: (state: IAddressCheckedState) => void;
  values: IAddressCheckedState;
  containerProps?: StackProps;
}) {
  const data = useGetArea();

  const [state, setState] = useState<{
    data: IAddressCheckedState;
    checkedTab: keyof IAddressCheckedState;
  }>({
    checkedTab: 'province',
    data: values,
  });

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
    if (props.open) {
      let checkedTab: keyof IAddressCheckedState = 'province';
      if (values.district) {
        checkedTab = 'district';
      } else if (values.city) {
        checkedTab = 'city';
      }
      setState((pre) => ({
        checkedTab,
        data: values,
      }));
    }
  }, [values, props.open]);

  return (
    <Drawer
      anchor="bottom"
      sx={{ userSelect: 'none', zIndex: (t) => t.zIndex.modal + 1 }}
      {...props}
    >
      <Stack {...containerProps}>
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
              props.onClose?.({}, 'backdropClick');
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!state.data.province || !state.data.city || !state.data.district}
            onClick={() => {
              onConfirm(state.data);
              props.onClose?.({}, 'backdropClick');
            }}
          >
            确定
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
