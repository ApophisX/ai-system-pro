import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  // {
  //   subheader: 'Overview',
  //   items: [
  //     // DEMO
  //     {
  //       title: 'One',
  //       path: paths.dashboard.root,
  //       icon: ICONS.dashboard,
  //       info: <Label>v{CONFIG.appVersion}</Label>,
  //     },
  //     { title: 'Two', path: paths.dashboard.two, icon: ICONS.ecommerce },
  //     { title: 'Three', path: paths.dashboard.three, icon: ICONS.analytics },
  //   ],
  // },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: '企业管理',
        path: paths.dashboard.management.enterprise,
        icon: ICONS.dashboard,
      },
      {
        title: '订单管理',
        icon: ICONS.order,
        path: paths.dashboard.management.order.root,
        children: [
          {
            title: '押金审核',
            path: paths.dashboard.management.order.depositAudit,
          },
        ],
      },
      {
        title: '资产管理',
        path: paths.dashboard.management.asset.list,
        icon: ICONS.product,
      },
      {
        title: '评论管理',
        path: paths.dashboard.management.review.list,
        icon: ICONS.chat,
      },
      {
        title: '举报管理',
        path: paths.dashboard.management.report.list,
        icon: ICONS.lock,
      },
      {
        title: '用户管理',
        path: paths.dashboard.management.user.list,
        icon: ICONS.user,
      },
      {
        title: '社区管理',
        path: paths.dashboard.management.community.list,
        icon: ICONS.folder,
      },
      // DEMO
      // {
      //   title: 'Group',
      //   path: paths.dashboard.group.root,
      //   icon: ICONS.user,
      //   children: [
      //     { title: 'Four', path: paths.dashboard.group.root },
      //     { title: 'Five', path: paths.dashboard.group.five },
      //     { title: 'Six', path: paths.dashboard.group.six },
      //   ],
      // },
    ],
  },
];
