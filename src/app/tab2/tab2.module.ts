import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab2Page } from './tab2.page';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { AppCurrencyPipe } from '../shared/pipes/app-currency.pipe';
import { MenuOptionsComponent } from './menu-options/menu-options.component';
import { AddRecordComponent } from './add-record/add-record.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Tab2PageRoutingModule,
    AppCurrencyPipe,
    MenuOptionsComponent
  ],
  declarations: [Tab2Page, AddRecordComponent]
})
export class Tab2PageModule {}
