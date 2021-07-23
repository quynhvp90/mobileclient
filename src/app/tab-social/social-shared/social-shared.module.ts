import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SocialChatComponent } from './social-chat/social-chat.component';
import { SocialChatService } from './social-chat/social-chat.service';
import { SocialItemComponent } from './social-item/social-item.component';
import { SocialListComponent } from './social-list/social-list.component';
import { SocialFriendListComponent } from './social-friend-list/social-friend-list.component';

@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  exports: [
    SocialItemComponent,
    SocialChatComponent,
    SocialListComponent,
    SocialFriendListComponent,
  ],
  providers: [
    SocialChatService,
  ],
  declarations: [
    SocialItemComponent,
    SocialChatComponent,
    SocialListComponent,
    SocialFriendListComponent,
  ],
  entryComponents: [
    SocialItemComponent,
    SocialChatComponent,
    SocialListComponent,
    SocialFriendListComponent,
  ],
})
export class SocialSharedModule {}
