import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  PopoverController,
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';

import { IBookRecord } from '../shared/modals/interest-book';
import { StorageService } from '../shared/services/storage.service';
import { MenuOptionsComponent } from '../tab2/menu-options/menu-options.component';
import { EditRecordComponent } from './edit-record/edit-record.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  //
  savedRecordsSub: Subscription;

  savedRecords: IBookRecord[];

  constructor(
    private popOverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {}

  ionViewWillEnter() {
    this.savedRecordsSub = this.storageService.savedRecords.subscribe(
      (records) => {
        this.savedRecords = records.filter((x) => x.type === 'saved');
        // this.calculateInterests(bookRecords);
      }
    );
  }

  ionViewWillLeave() {
    this.savedRecordsSub?.unsubscribe();
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
      component: EditRecordComponent,
      componentProps: { editRecord: bookRecord },
    });

    await modalEl.present();
    const { data } = await modalEl.onDidDismiss();
    if (!data) {
      return;
    }
    // if (data?.formData) {
    //   let record: IBookRecord = this.prepareBookRecord(
    //     data.formData,
    //     bookRecord
    //   );
    //   const result = await this.storageService.updateRecord(record);
    //   this.storageService.updateSavedRecords(result);
    //   this.showToast('Record saved successfully', 'success');
    //   return;
    // }
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

  async deleteRecord(bookRecord: IBookRecord) {
    const result = await this.storageService.deleteRecord(bookRecord.id);
    this.storageService.updateSavedRecords(result);
    const toast = await this.toastCtrl.create({
      header: 'Record deleted successfully',
      position: 'top',
      color: 'success',
      duration: 3000,
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
    });
    await toast.present();
  }
}
