import type { IconifyJSON } from '@iconify/react';

import { addCollection } from '@iconify/react';

import allIcons from './icon-sets';

// ----------------------------------------------------------------------

export const iconSets = Object.entries(allIcons).reduce((acc, [key, value]) => {
  const [prefix, iconName] = key.split(':');
  const existingPrefix = acc.find((item) => item.prefix === prefix);

  if (existingPrefix) {
    existingPrefix.icons[iconName] = value;
  } else {
    acc.push({
      prefix,
      icons: {
        [iconName]: value,
      },
    });
  }

  return acc;
}, [] as IconifyJSON[]);

export const allIconNames = Object.keys(allIcons) as IconifyName[];

export type IconifyName = keyof typeof allIcons;

/** 提现模块使用的图标（均来自 icon-sets） */
export const withdrawIcons = {
  pending: 'material-symbols:arming-countdown-outline' as IconifyName,
  reviewing: 'solar:restart-bold' as IconifyName,
  wallet: 'solar:wad-of-money-bold' as IconifyName,
  completed: 'solar:check-circle-bold' as IconifyName,
  rejected: 'solar:close-circle-bold' as IconifyName,
  fileText: 'solar:file-text-bold' as IconifyName,
  danger: 'solar:danger-bold' as IconifyName,
  export: 'solar:export-bold' as IconifyName,
  billList: 'solar:bill-list-bold' as IconifyName,
};

// ----------------------------------------------------------------------

let areIconsRegistered = false;

export function registerIcons() {
  if (areIconsRegistered) {
    return;
  }

  iconSets.forEach((iconSet) => {
    const iconSetConfig = {
      ...iconSet,
      width: (iconSet.prefix === 'carbon' && 32) || 24,
      height: (iconSet.prefix === 'carbon' && 32) || 24,
    };

    addCollection(iconSetConfig);
  });

  areIconsRegistered = true;
}
