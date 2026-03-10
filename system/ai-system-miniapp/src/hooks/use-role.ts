export type UserRole = 'lessor' | 'lessee';

import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';

const CHOSEN_ROLE_STORAGE_KEY = 'chosenRole';

export function useUserRole() {
  const [userRole, _setUserRole] = useState<UserRole>('lessee'); // 默认角色：租赁方

  const setUserRole = useCallback((role: UserRole) => {
    Taro.setStorageSync(CHOSEN_ROLE_STORAGE_KEY, role);
    _setUserRole(role);
  }, []);

  useEffect(() => {
    const role = Taro.getStorageSync(CHOSEN_ROLE_STORAGE_KEY);
    if (role) {
      setUserRole(role as UserRole);
    }
  }, [setUserRole]);

  return { userRole, setUserRole };
}
