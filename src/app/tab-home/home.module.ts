import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { HomeListComponent } from './home-list/home-list.component';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HomeListComponent },
    ]),
  ],
  declarations: [
    HomeListComponent
  ],
  entryComponents: [
  ],
})
export class HomeModule {}
