import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  PopoverController,
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';

import { ISavedRecord } from '../shared/modals/interest-book';
import { StorageService } from '../shared/services/storage.service';
import { MenuOptionsComponent } from '../tab2/menu-options/menu-options.component';
import { EditRecordComponent } from './edit-record/edit-record.component';
import { calculateInterestWithDates, calculateInterestWithDuration } from '../utils';
import { AdmobService } from '../shared/services/admob.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  //
  savedRecordsSub: Subscription;

  savedRecords: ISavedRecord[];
  searchText: string;

  constructor(
    private popOverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private adMobService: AdmobService
  ) {}

  ionViewWillEnter() {
    this.savedRecordsSub = this.storageService.savedRecords.subscribe(
      (records) => {
        const savedRecords = records.filter((x) => x.type === 'saved') as ISavedRecord[];
        this.calculateInterests(savedRecords);
      }
    );
    // const adUnitId = environment.interestCalBannerAdUnitId;
    // const adUnitId = 'ca-app-pub-3940256099942544/6300978111'; // Test Ad Unit ID
    // this.adMobService.showBannerAd('saved-records', adUnitId);
  }

  ionViewWillLeave() {
    this.savedRecordsSub?.unsubscribe();
    // this.adMobService.hideBannerAd();
  }

  calculateInterests(savedRecords: ISavedRecord[]) {
    if (!savedRecords || savedRecords.length === 0) {
      this.savedRecords = [];
      return;
    }
    savedRecords.forEach((record: ISavedRecord) => {
      let interestRate = record.interestRate;
      if (record.interestType === 'rupees') {
        interestRate = interestRate * 12;
      }
      let interestResult = null;
      if (record.tenureType === 'dates') {
        interestResult = calculateInterestWithDates({
          principal: record.principalAmount,
          rate: interestRate,
          interestType: record.calculationType,
          compoundFrequency: record.compoundFrequency,
          startDate: new Date(record.fromDate),
          endDate: new Date(record.toDate),
        }, true);
      } else {
        interestResult = calculateInterestWithDuration({
          principal: record.principalAmount,
          rate: interestRate,
          interestType: record.calculationType,
          compoundFrequency: record.compoundFrequency,
          years: record.years || 0,
          months: record.months || 0,
          days: record.days || 0,
        }, true);
      }
      record.interestAmount = interestResult.interestBreakdown.interestTotal;
      record.totalDue = interestResult.totalAmount;
      record.duration = interestResult.duration.totalStr;
    });
    this.savedRecords = savedRecords;
  }

  onSearchRecords(event: any) {
    this.searchText = event.detail.value;
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
      component: EditRecordComponent,
      componentProps: { editRecord: bookRecord },
    });

    await modalEl.present();
    const { data } = await modalEl.onDidDismiss();
    if (!data) {
      return;
    }
    if (data?.updatedRecord) {
      const result = await this.storageService.updateRecord(data.updatedRecord);
      this.storageService.updateSavedRecords(result);
      this.showToast('Receipt updated successfully', 'success');
      return;
    }
    this.showToast('Unable to edit receipt', 'danger', 'Please try again');
  }

  async onClickDelete(bookRecord: any) {
    const alertEl = await this.alertCtrl.create({
      header: 'Delete the receipt ?',
      message: 'Receipt will be deleted permanently and cannot be restored.',
      buttons: [
        {
          role: 'cancel',
          text: 'Cancel',
          cssClass: 'ion-text-medium',
        },
        {
          role: 'destructive',
          text: 'Delete',
          cssClass: 'ion-text-danger',
        },
      ],
    });
    await alertEl.present();
    const { role } = await alertEl.onDidDismiss();
    if (role === 'cancel') {
      return;
    }
    this.deleteRecord(bookRecord);
  }

  async deleteRecord(bookRecord: ISavedRecord) {
    const result = await this.storageService.deleteRecord(bookRecord.id);
    this.storageService.updateSavedRecords(result);
    const toast = await this.toastCtrl.create({
      header: 'Receipt deleted successfully',
      position: 'top',
      color: 'success',
      duration: 3000,
      positionAnchor: 'saved-records-header',
    });
    await toast.present();
  }

  async showToast(header: string, type: string, message?: string) {
    const toast = await this.toastCtrl.create({
      header: header,
      message: message,
      position: 'top',
      color: type,
      duration: 2500,
      positionAnchor: 'saved-records-header',
    });
    await toast.present();
  }
}
