import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';

import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    NotificationListComponent,
    NotificationItemComponent,
  ],
  declarations: [
    NotificationsComponent,
    NotificationListComponent,
    NotificationItemComponent,
  ],
  entryComponents: [
    NotificationListComponent,
    NotificationItemComponent,
  ],
})
export class TabNotificationPageModule {}
