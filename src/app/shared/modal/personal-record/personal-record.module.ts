import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {PersonalRecordModal} from './personal-record-modal';
@NgModule({
     declarations: [
      PersonalRecordModal
     ],
     imports: [
       IonicModule,
       CommonModule
     ],
     entryComponents: [
      PersonalRecordModal
     ]
})
export class PersonalRecordModalModule {}
