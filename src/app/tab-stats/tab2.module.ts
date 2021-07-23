import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsListComponent } from './stats-list/stats-list.component';
import { StatDetailComponent } from './stat-detail/stat-detail.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: StatsListComponent },
    { path: 'detail/:id', component: StatDetailComponent },
    ]),
  ],
  declarations: [
    StatsListComponent,
    StatDetailComponent,
  ],
})
export class Tab2PageModule {}
