import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertController, ModalController, PopoverController, ToastController } from '@ionic/angular';

import { MenuOptionsComponent } from './menu-options/menu-options.component';
import { AddRecordComponent } from './add-record/add-record.component';
import { StorageService } from '../shared/services/storage.service';
import { IBookRecord, IBookSummary } from '../shared/modals/interest-book';
import { calculateInterestWithDates } from '../utils';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  //
  savedRecordsSub: Subscription;

  amountSummary: IBookSummary;
  bookRecords: any[];

  constructor(
    private popOverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {
  }

  ngOnInit(): void {

  }

  ionViewWillEnter() {
    this.savedRecordsSub = this.storageService.savedRecords.subscribe((records) => {
      const bookRecords = records.filter(x => x.type !== 'saved');
      this.calculateInterests(bookRecords);
    });
  }

  ionViewWillLeave() {
    this.savedRecordsSub?.unsubscribe();
  }

  calculateInterests(bookRecords: IBookRecord[]) {
    if (!bookRecords || !bookRecords.length) {
      this.bookRecords = [];
      return;
    }
    const acSummary: IBookSummary = {
      netAmount: 0,
      totalLent: 0,
      totalLentInterest: 0,
      totalLentItems: 0,
      totalBorrowed: 0,
      totalBorrowedInterest: 0,
      totalBorrowedItems: 0
    };
    bookRecords.forEach((x: IBookRecord) => {
      const interestResult = calculateInterestWithDates({
        principal: x.principalAmount,
        rate: x.interestRate,
        interestType: x.calculationType,
        compoundFrequency: x.compoundFrequency,
        startDate: new Date(x.fromDate),
        endDate: new Date(),
      }, true);
      x.duration = interestResult.duration.totalStr;
      x.interestAmount = interestResult.interestBreakdown.interestTotal;
      x.totalDue = interestResult.totalAmount;
      // Updating summary
      if (x.type === 'lend') {
        acSummary.totalLent += x.principalAmount;
        acSummary.totalLentInterest += x.interestAmount;
        acSummary.totalLentItems += 1;
      } else {
        acSummary.totalBorrowed += x.principalAmount;
        acSummary.totalBorrowedInterest += x.interestAmount;
        acSummary.totalBorrowedItems += 1;
      }
    });
    acSummary.netAmount = (acSummary.totalLent + acSummary.totalLentInterest) - (acSummary.totalBorrowed + acSummary.totalBorrowedInterest);
    this.bookRecords = bookRecords;
    this.amountSummary = acSummary;
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
        this.onClickDelete(bookRecord);
      }
    }
  }

  async onEditRecord(bookRecord: any) {
    const modalEl = await this.modalCtrl.create({
      component: AddRecordComponent,
      componentProps: { editRecord: bookRecord },
    });

    await modalEl.present();
    const { data } = await modalEl.onDidDismiss();
    if (!data) {
      return;
    }
    if (data?.formData) {
      let record: IBookRecord = this.prepareBookRecord(data.formData, bookRecord);
      const result = await this.storageService.updateRecord(record);
      this.storageService.updateSavedRecords(result);
      this.showToast('Record saved successfully', 'success');
      return;
    }
    this.showToast('Unable to edit record', 'danger', 'Please try again');
  }

  async onClickDelete(bookRecord: any) {
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
    const { role } = await alertEl.onDidDismiss();
    if (role === 'cancel') {
      return;
    }
    this.deleteRecord(bookRecord);
  }

  async deleteRecord(bookRecord: IBookRecord) {
    const result = await this.storageService.deleteRecord(bookRecord.id);
    this.storageService.updateSavedRecords(result);
    const toast = await this.toastCtrl.create({
      header: 'Record deleted successfully',
      position: 'top',
      color: 'success',
      duration: 3000
    });
    await toast.present();
  }

  async onClickAddRecord() {
    const modalEl = await this.modalCtrl.create({
      component: AddRecordComponent,
    });

    await modalEl.present();
    const { data } = await modalEl.onDidDismiss();
    if (!data) {
      return;
    }
    if (data?.formData) {
      let record: IBookRecord = this.prepareBookRecord(data.formData);
      const result = await this.storageService.addRecord(record);
      this.storageService.updateSavedRecords(result);
      this.showToast('Record saved successfully', 'success');
      return;
    }
    this.showToast('Unable to add record', 'danger', 'Please try again');
  }

  prepareBookRecord(formData: any, editRecord?: IBookRecord): IBookRecord {
    const record: IBookRecord = {
      id: editRecord ? editRecord.id : new Date().getTime(),
      name: formData.name,
      type: formData.recordType,
      mobileNumber: formData.mobileNumber,
      interestType: formData.interestType,
      interestRate: formData.interestRate,
      principalAmount: formData.principal,
      calculationType: formData.calculationType,
      compoundFrequency: formData.interval,
      notes: formData.notes,
      fromDate:  formData.fromDate,
      toDate:  formData.toDate,
    };
    return record;
  }

  async showToast(header: string, type: string, message?: string) {
    const toast = await this.toastCtrl.create({
     header: header,
     message: message,
     position: 'top',
     color: type,
     duration: 2500
   });
   await toast.present();
  }

}
