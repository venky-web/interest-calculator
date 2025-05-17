import { Component, OnInit } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-menu-options',
  template: `
    <ion-list lines="full">
      <ion-item button (click)="selectOption('edit')">
        <ion-icon name="create-outline" slot="start" color="primary"></ion-icon>
        <ion-text color="primary">Edit</ion-text>
      </ion-item>
      <ion-item button (click)="selectOption('delete')">
        <ion-icon name="trash-outline" slot="start" color="danger"></ion-icon>
        <ion-text color="danger">Delete</ion-text>
      </ion-item>
      <ion-item button (click)="closeWithoutSelection()">
        <ion-icon name="close-outline" slot="start" color="medium"></ion-icon>
        <ion-text color="medium">Cancel</ion-text>
      </ion-item>
    </ion-list>
  `,
  styles: [
    `
      ion-item {
        ion-icon {
          margin-right: 1rem;
        }
      }
    `
  ],
})
export class MenuOptionsComponent {

  constructor(private popoverCtrl: PopoverController) {}

  selectOption(option: string) {
    this.popoverCtrl.dismiss({ selected: option });
  }

  closeWithoutSelection() {
    this.popoverCtrl.dismiss(null);
  }
}
