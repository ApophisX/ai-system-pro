import type { UserRole } from '../types';

import { useState, useEffect, useCallback } from 'react';

const CHOSEN_ROLE_STORAGE_KEY = 'chosenRole';

export function useGetUserRole() {
  const [userRole, _setUserRole] = useState<UserRole>('lessee'); // 默认角色：租赁方

  const setUserRole = useCallback((role: UserRole) => {
    localStorage.setItem(CHOSEN_ROLE_STORAGE_KEY, role);
    _setUserRole(role);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem(CHOSEN_ROLE_STORAGE_KEY);
    if (role) {
      setUserRole(role as UserRole);
    }
  }, [setUserRole]);

  return { userRole, setUserRole };
}
