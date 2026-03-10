import { useGetLocationDetail } from "@/actions/location";
import { DEFAULT_LOCATION } from "@/constants/app";
import { AppLocation } from "@/model/location";
import Taro from "@tarojs/taro";
import { useLoad } from "@tarojs/taro";
import { useCallback, useState } from "react";

export function useGetLocation({
  value = new AppLocation(),
  getCurrentLocation = false,
}: {
  value?: AppLocation | null;
  getCurrentLocation?: boolean;
} = {}) {
  const [location, setLocation] = useState(value);
  const { getLocation } = useGetLocationDetail();
  const chooseLocation = useCallback(() => {
    Taro.chooseLocation({
      longitude: location?.longitude || DEFAULT_LOCATION.longitude,
      latitude: location?.latitude || DEFAULT_LOCATION.latitude,
      success: async (res) => {
        const locationData = await getLocation(res);
        setLocation(locationData);
      },
    });
  }, [setLocation, getLocation, location]);

  useLoad(() => {
    if (!getCurrentLocation) return;
    Taro.getLocation({
      type: "2",
      success: async (res) => {
        const locationData = await getLocation(res);
        setLocation(locationData);
      },
      fail: () => {},
    });
  });

  return { location, chooseLocation };
}
