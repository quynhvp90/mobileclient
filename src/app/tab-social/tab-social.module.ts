import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SocialComponent } from './social/social.component';

import { SocialInvitationsComponent } from './social-invitations/social-invitations.component';
import { SocialSharedModule } from './social-shared/social-shared.module';

import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SocialComponent,
  },
  { path: 'invitations/:id', component: SocialInvitationsComponent },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    SocialSharedModule,
    RouterModule.forChild(routes),
  ],
  exports: [
  ],
  declarations: [
    SocialComponent,
    SocialInvitationsComponent,
  ],
})
export class TabSocialPageModule {}
