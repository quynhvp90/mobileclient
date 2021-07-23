import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './shared/components/login/login.component';
import { PasswordResetComponent } from './shared/components/password-reset/password-reset.component';
import { ConfirmComponent } from './shared/components/confirm/confirm.component';
import { LogRepsIntroComponent } from './shared/components/logreps-intro/logreps-intro.component';
import { AuthGuardService } from './shared/services';

const routes: Routes = [
  {
    path: '',
    loadChildren: './tabs/tabs.module#TabsPageModule',
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
    canLoad: [AuthGuardService],
    runGuardsAndResolvers: 'always',
  },
  { path: 'confirm', component: ConfirmComponent },
  { path: 'login', component: LoginComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'intro', component: LogRepsIntroComponent },
];
@NgModule({
  imports: [
    HttpClientModule,
    [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
