import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
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
        path: 'jobs',
        children: [
          {
            path: '',
            loadChildren: '../job/job.module#JobModule',
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
