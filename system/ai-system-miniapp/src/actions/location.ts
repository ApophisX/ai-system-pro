import { AppLocation } from '@/model/location';
import { LocationApi } from '@/services';
import { useGetData } from '@/utils/request';
import { useCallback } from 'react';

export function useGetAreaData() {
  const result = useGetData<{
    city_list: Record<string, string>;
    province_list: Record<string, string>;
    district_list: Record<string, string>;
  }>({
    url: APP_URL + `/static/mock/area.json`,
    extraConfig: { useFullUrl: true },
  });

  const getCityByDistrictCode = useCallback(
    (districtCode: string) => {
      const cityPrefixCode = districtCode.slice(0, 4);
      const provincePrefixCode = districtCode.slice(0, 2);

      const cityKeys = Object.keys(result.data?.city_list || {});
      const provinceKeys = Object.keys(result.data?.province_list || {});

      const cityKey = cityKeys.find(key => key.startsWith(cityPrefixCode));
      const provinceKey = provinceKeys.find(key => key.startsWith(provincePrefixCode));
      return {
        city: cityKey ? result.data?.city_list[cityKey] : null,
        cityCode: cityKey,
        province: provinceKey ? result.data?.province_list[provinceKey] : null,
        provinceCode: provinceKey,
      };
    },
    [result.data],
  );

  return {
    ...result,
    getCityByDistrictCode,
  };
}

export function useGetLocationDetail() {
  const { getCityByDistrictCode } = useGetAreaData();

  const getLocation = useCallback(
    async (params: { longitude: number; latitude: number; name?: string; address?: string }) => {
      const { name, address, latitude, longitude } = params;
      const result = await LocationApi.getLocationDetail(latitude, longitude);
      const { ad_info, formatted_addresses } = result.result;
      const { adcode, city, province, district } = ad_info;
      const { recommend, standard_address } = formatted_addresses;
      const cityData = getCityByDistrictCode(adcode);

      const location = new AppLocation({
        district,
        districtCode: adcode,
        city,
        cityCode: cityData.cityCode,
        province,
        provinceCode: cityData.provinceCode,
        longitude,
        latitude,
        name: name || recommend,
        address: address || standard_address,
      });
      return location;
    },
    [getCityByDistrictCode],
  );

  return {
    getLocation,
  };
}
