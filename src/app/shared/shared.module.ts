import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MuscleComponent } from './components/muscle/muscle.component';
import { ActivityIconComponent } from './components/activity-icon/activity-icon.component';
import { ChallengeTeamIconComponent } from './components/challenge-team-icon/challenge-team-icon.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { StopwatchComponent } from './components/stopwatch/stopwatch.component';
import { InvitesComponent } from './components/invites/invites.component';
import { EmoteStatsComponent } from './components/emote-stats/emote-stats.component';
import { ActivityRowComponent } from './components/activity-row/activity-row.component';
import { StatsRowComponent } from './components/stats-row/stats-row.component';
import { StatsCalendarWeekComponent } from './components/stats-calendar-week/stats-calendar-week.component';
import { TestComponent } from './components/test/test.component';
import { LoginComponent } from './components/login/login.component';
import { LoginCodeComponent } from './components/login-code/login-code.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { LogRepsIntroComponent } from './components/logreps-intro/logreps-intro.component';
import { PurchaseComponent } from './components/purchase-license/purchase-license.component';
import { BannerAdComponent } from './components/banner-ad/banner-ad.component';
import { LicenseModalModule } from './modal/license/license-modal.module';
import { ListActivityIconsModal } from './modal/list-activity-icons/list-activity-icons-modal';
import { MuscleModal } from './modal/muscle/muscle-modal';
import { AddFriendModal } from './modal/add-friend/add-friend-modal';
import { AvatarBuilderModal } from './modal/avatar-builder/avatar-builder-modal';
import { StopWatchModal } from './modal/stop-watch/stop-watch-modal';
import { FriendsModal } from './modal/friends/friends-modal';
import { ExportDataModal } from './modal/export-data/export-data-modal';

import { ShowFriendModal } from './modal/show-friend/show-friend-modal';
import { ListAvatarModal } from './modal/list-avatar/list-avatar-modal';
import { SelectImageModal } from './modal/select-image/select-image-modal';
import { SelectWorkoutModal } from './modal/select-workout/select-workout-modal';
import { ShareOptionsModal } from './modal/share-options/share-options-modal';
import { CreatePostModal } from './modal/create-post/create-post-modal';
import { EmoteDetailModal } from './modal/emote-detail/emote-detail-modal';

import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { UserSettingComponent } from './components/user-setting/user-setting.component';
import { UserHealthComponent } from './components/user-health/user-health.component';
import { UserWeeklyReportComponent } from './components/user-weeklyreport/user-weeklyreport.component';
import { UserPrivacyComponent } from './components/user-privacy/user-privacy.component';
import { FeatureSuggestionsComponent } from './components/feature-suggestions/feature-suggestions.component';

import { NotificationsComponent } from './modal/notifications/notifications.component';

import { MessageItemComponent } from './components/message-item/message-item.component';
import { MessageListComponent } from './components/message-list/message-list.component';

import { EmotePopover } from './popover/emote/emote-popover';
import { TooltipPopover } from './popover/tooltip/tooltip-popover';

// import { RepProgressComponent } from './components/rep-progress/rep-progress.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Ng2OdometerModule } from 'ng2-odometer';
import { GroupByPipe } from './pipes/group-by.pipe';
import { TimeAgoPipe } from 'time-ago-pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LicenseModalModule,
    Ng2OdometerModule.forRoot(),
  ],
  exports: [
    CommonModule,
    ActivityIconComponent,
    ChallengeTeamIconComponent,
    MuscleComponent,
    ListActivityIconsModal,
    MuscleModal,
    AddFriendModal,
    AvatarBuilderModal,
    StopWatchModal,
    FriendsModal,
    ExportDataModal,
    ShowFriendModal,

    ListAvatarModal,
    SelectImageModal,
    SelectWorkoutModal,
    ShareOptionsModal,
    CreatePostModal,
    EmoteDetailModal,
    NotificationsComponent,
    MessageItemComponent,
    MessageListComponent,
    ActivityRowComponent,
    CountdownComponent,
    StopwatchComponent,
    InvitesComponent,
    EmoteStatsComponent,
    StatsRowComponent,
    StatsCalendarWeekComponent,
    TestComponent,
    LoginComponent,
    LoginCodeComponent,
    PurchaseComponent,
    BannerAdComponent,
    PasswordResetComponent,
    ConfirmComponent,
    LogRepsIntroComponent,
    GroupByPipe,
    TimeAgoPipe,
    UserAvatarComponent,
    UserStatsComponent,
    UserSettingComponent,
    UserHealthComponent,
    UserWeeklyReportComponent,
    UserPrivacyComponent,
    FeatureSuggestionsComponent,
    // RepProgressComponent

    EmotePopover,
    TooltipPopover,
  ],
  declarations: [
    ActivityIconComponent,
    ChallengeTeamIconComponent,
    MuscleComponent,
    ListActivityIconsModal,
    MuscleModal,
    AddFriendModal,
    AvatarBuilderModal,
    StopWatchModal,
    FriendsModal,
    ExportDataModal,
    ShowFriendModal,
    ListAvatarModal,
    SelectImageModal,
    SelectWorkoutModal,
    ShareOptionsModal,
    CreatePostModal,
    EmoteDetailModal,
    NotificationsComponent,
    MessageItemComponent,
    MessageListComponent,
    ActivityRowComponent,
    CountdownComponent,
    StopwatchComponent,
    InvitesComponent,
    EmoteStatsComponent,
    StatsRowComponent,
    StatsCalendarWeekComponent,
    TestComponent,
    LoginComponent,
    LoginCodeComponent,
    PurchaseComponent,
    BannerAdComponent,
    PasswordResetComponent,
    ConfirmComponent,
    LogRepsIntroComponent,
    GroupByPipe,
    TimeAgoPipe,
    UserAvatarComponent,
    UserStatsComponent,
    UserSettingComponent,
    UserHealthComponent,
    UserWeeklyReportComponent,
    UserPrivacyComponent,
    FeatureSuggestionsComponent,
    // RepProgressComponent

    EmotePopover,
    TooltipPopover,
  ],
  entryComponents: [
    ListActivityIconsModal,
    MuscleModal,
    FriendsModal,
    ExportDataModal,
    AddFriendModal,
    AvatarBuilderModal,
    StopWatchModal,
    ShowFriendModal,
    ListAvatarModal,
    SelectImageModal,
    SelectWorkoutModal,
    ShareOptionsModal,
    CreatePostModal,
    EmoteDetailModal,
    NotificationsComponent,
    MessageItemComponent,
    MessageListComponent,
    UserHealthComponent,
    UserWeeklyReportComponent,
    UserPrivacyComponent,
    FeatureSuggestionsComponent,
    UserAvatarComponent,
    UserStatsComponent,
    EmotePopover,
    TooltipPopover,
  ],
})
export class SharedModule { }
