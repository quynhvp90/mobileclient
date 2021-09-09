import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLoadService } from './shared/services/app-load.service';
// import { FCM } from '@ionic-native/fcm/ngx';
// import { SocialSharing } from '@ionic-native/social-sharing/ngx';
// import { Pro } from '@ionic/pro';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';

export function init_app(firstLoadService: AppLoadService) {
  return () => firstLoadService.initializeMyApp();
}

import {
  ActivityService,
  ActivityLogService,
  AlertService,
  ApiService,
  AuthService,
  AuthGuardService,
  BroadcastService,
  ExceptionService,
  GlobalService,
  IntercomService,
  LoginService,
  SpinnerService,
  ToastService,
  UserService,
  // OrganizationService,
  UtilityService,
  WindowService,
  WorkoutService,
  TipsService,
  IonicAlertService,
  ReportService,
  StatsService,
  OrdersService,
  ContactService,
  ChatroomService,
  DocumentEventService,
  // ChallengeTeamService,
  AnimationService,
  DeepLinkService,
  PostService,
  PostcardService,
  PushNotificationService,
  ShareService,
  HealthService,
  SocialService,
  MessageService,
  NotificationService,
  SettingsService,
  InviteService,
} from './shared/services';
import { JobModule } from './job/job.module';

@NgModule({
  declarations: [
    AppComponent,

  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    IonicModule.forRoot({
      animated: true, // disable animation
      mode: 'ios',
      backButtonText: 'Back',
      // modalEnter: 'modal-slide-in',
      // modalLeave: 'modal-slide-out',
      // tabsPlacement: 'bottom',
      // pageTransition: 'ios-transition',
    }),
    IonicStorageModule.forRoot(),
    JobModule,
    AppRoutingModule,
  ],
  providers: [
    AppLoadService,
    { provide: APP_INITIALIZER, useFactory: init_app, deps: [AppLoadService], multi: true },
    StatusBar,
    SplashScreen,

    ActivityService,
    ContactService,
    ChatroomService,
    DocumentEventService,
    // ChallengeTeamService,
    AnimationService,
    DeepLinkService,
    PostService,
    PostcardService,
    PushNotificationService,
    ShareService,
    HealthService,
    SocialService,
    MessageService,
    NotificationService,
    SettingsService,
    InviteService,
    ActivityLogService,

    ApiService,
    AlertService,
    AuthService,
    AuthGuardService,
    BroadcastService,
    ExceptionService,
    GlobalService,
    IntercomService,
    LoginService,
    SpinnerService,
    ToastService,
    UserService,
    // OrganizationService,
    UtilityService,
    WindowService,
    WorkoutService,
    TipsService,
    IonicAlertService,
    ReportService,
    StatsService,
    OrdersService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // FCM,
    // SocialSharing,
    FirebaseDynamicLinks,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
