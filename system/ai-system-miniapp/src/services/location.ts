import { request } from '@/utils/request';

export async function getLocationDetail(latitude: number, longitude: number) {
  const result = await request<{ data: API_RESPONSE.IWXLocationResponse }>(
    `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${LOCATION_APIKEY}`,
    {},
    { useFullUrl: true },
  );
  return result.data;
}
