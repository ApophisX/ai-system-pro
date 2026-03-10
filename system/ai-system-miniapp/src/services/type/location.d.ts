declare namespace API_RESPONSE {
  interface IWXLocationResponse {
    result: {
      ad_info: {
        adcode: string;
        city: string;
        city_code: string;
        district: string;
        name: string;
        nation: string;
        nation_code: string;
        phone_area_code: string;
        province: string;
        _distance: string;
        location: { lat: number; lng: number };
      };
      address_component: {
        city: string;
        district: string;
        nation: string;
        province: string;
        street: string;
        street_number: string;
      };
      formatted_addresses: {
        recommend: string;
        rough: string;
        standard_address: string;
      };

      address: string;
    };
    message: string;
    status: number; // 0:成功
  }
}
