import { Component, OnInit } from '@angular/core';

import { AlertController, ModalController, PopoverController, ToastController } from '@ionic/angular';

import { MenuOptionsComponent } from './menu-options/menu-options.component';
import { AddRecordComponent } from './add-record/add-record.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  //
  amountSummary: any;
  totalRecords: any[];

  constructor(
    private popOverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
  ) {
  }

  ngOnInit(): void {
    this.amountSummary = {
      netAmount: -1456664,
      totalLent: 100000,
      totalLentInterest: 6000,
      totalLentItems: 2,
      totalBorrowed: 1426000,
      totalBorrowedInterest: 166664,
      totalBorrowedItems: 5
    };
        this.totalRecords = [
      {
        type: 'borrow',
        name: 'my name',
        principal: 50000,
        rate: 12,
        interestType: 'rupees',
        givenDate: new Date(),
        endDate: new Date(),
        calculationType: 'simple',
        duration: '2Y 3M 14D',
        totalInterest: 5000000,
        totalDue: 55000000,
        compoundFrequency: 'half-yearly',
      },
      {
        type: 'lent',
        name: 'my name',
        principal: 50000,
        rate: 12,
        interestType: 'rupees',
        givenDate: new Date(),
        endDate: new Date(),
        calculationType: 'simple',
        duration: '2Y 3M 14D',
        totalInterest: 5000000,
        totalDue: 55000000,
        compoundFrequency: 'half-yearly',
      },
    ];
  }

  onSearchRecords(event: any) {
    //
  }

  async onClickMenu(event: any, bookRecord: any) {
    const popover = await this.popOverCtrl.create({
      component: MenuOptionsComponent,
      event: event,
      translucent: true,
      showBackdrop: true,
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.selected) {
      if (data.selected === 'edit') {
        this.onEditRecord(bookRecord);
      } else {
        this.onDeleteRecord(bookRecord);
      }
    }
  }

  onEditRecord(bookRecord: any) {
    //
  }

  async onDeleteRecord(bookRecord: any) {
    const alertEl = await this.alertCtrl.create({
      header: 'Delete the record ?',
      message: 'Record will be deleted permanently and cannot be restored.',
      buttons: [
        {
          role: 'cancel',
          text: 'Cancel',
          cssClass: 'ion-text-medium'
        },
        {
          role: 'destructive',
          text: 'Delete',
          cssClass: 'ion-text-danger'
        }
      ]
    });
    await alertEl.present();
    const { data } = await alertEl.onDidDismiss();
    console.log(data);
    const toast = await this.toastCtrl.create({
      header: 'Record deleted successfully',
      position: 'top',
      color: 'success',
      duration: 2000
    });
    await toast.present();
  }

  async onClickAddRecord() {
    console.log('add');
    const modalEl = await this.modalCtrl.create({
      component: AddRecordComponent,
    });

    await modalEl.present();
    const { data } = await modalEl.onDidDismiss();
    console.log(data);
  }

}
