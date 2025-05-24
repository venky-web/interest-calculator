import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab3Page } from './tab3.page';
import { Tab3PageRoutingModule } from './tab3-routing.module';
import { EditRecordComponent } from './edit-record/edit-record.component';
import { AppCurrencyPipe } from '../shared/pipes/app-currency.pipe';
import { MenuOptionsComponent } from '../tab2/menu-options/menu-options.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Tab3PageRoutingModule,
    AppCurrencyPipe,
    MenuOptionsComponent
  ],
  declarations: [Tab3Page, EditRecordComponent]
})
export class Tab3PageModule {}
