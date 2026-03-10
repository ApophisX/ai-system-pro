import { DEFAULT_LOCATION } from "@/constants/app";

export interface ILocation {
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  district: string;
  districtCode: string;
  address: string;
  name: string;
  longitude: number;
  latitude: number;
}

export class AppLocation implements ILocation {
  name: string = "";
  province: string = "";
  provinceCode: string = "";
  city: string = "";
  cityCode: string = "";
  district: string = "";
  districtCode: string = "";
  address: string = "";
  longitude: number;
  latitude: number;

  constructor(params?: Partial<ILocation>) {
    Object.assign(this, params || DEFAULT_LOCATION);
  }

  getFullAddress(options: { showProvince?: boolean; showCity?: boolean } = {}) {
    let prefix = "";
    if (options.showProvince) {
      prefix += `${this.province} `;
    }
    if (options.showCity) {
      prefix += `${this.city} `;
    }
    return `${prefix}${this.district}${this.address}`;
  }

  get fullAddress() {
    return this.name || this.getFullAddress() || "";
  }
}
