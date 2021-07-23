import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: '../tab-activity/tab1.module#Tab1PageModule',
          },
        ],
      },
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../tab-home/home.module#HomeModule',
          },
        ],
      },
      {
        path: 'activities',
        children: [
          {
            path: '',
            loadChildren: '../tab-activity/tab1.module#Tab1PageModule',
          },
        ],
      },
      {
        path: 'stats',
        children: [
          {
            path: '',
            loadChildren: '../tab-stats/tab2.module#Tab2PageModule',
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: '../tab-setting/tab3.module#Tab3PageModule',
          },
        ],
      },
      {
        path: 'social',
        children: [
          {
            path: '',
            loadChildren: '../tab-social/tab-social.module#TabSocialPageModule',
          },
        ],
      },
      {
        path: 'challenges',
        children: [
          {
            path: '',
            loadChildren: '../challenges/challenge.module#ChallengePageModule',
          },
        ],
      },
      {
        path: 'notifications',
        children: [
          {
            path: '',
            loadChildren: '../tab-notifications/tab-notifications.module#TabNotificationPageModule',
          },
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/(tap1:tap1)',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
