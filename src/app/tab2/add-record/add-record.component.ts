import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IonModal, ModalController } from '@ionic/angular';

import { IBookRecord } from 'src/app/shared/modals/interest-book';

@Component({
    selector: 'app-add-record',
    templateUrl: './add-record.component.html',
    styleUrls: ['./add-record.component.scss'],
    standalone: false
})
export class AddRecordComponent  implements OnInit {
  //
  @Input() editRecord: IBookRecord;

  recordForm: FormGroup;

  invalidDatesError: boolean;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.createRecordForm();
    if (this.editRecord) {
      this.patchForm();
    }
    this.recordForm.controls['calculationType'].valueChanges.subscribe(
      (value: string) => {
        console.log(value);
        if (value === 'compound') {
          const ctrl = new FormControl('yearly', {
            updateOn: 'blur',
            validators: [Validators.required],
          });
          this.recordForm.addControl('interval', ctrl);
        } else {
          this.recordForm.removeControl('interval');
        }
      }
    );
  }

  createRecordForm() {
    const today = new Date();
    this.recordForm = new FormGroup({
      recordType: new FormControl('lend', {
        updateOn: 'change',
        validators: [Validators.required],
      }),
      name: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/)]
      }),
      mobileNumber: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.pattern(/^[6-9]\d{9}$/)]
      }),
      notes: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.maxLength(255)]
      }),
      principal: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.max(1000000000000)],
      }),
      interestType: new FormControl('rupees', {
        updateOn: 'change',
        validators: [Validators.required],
      }),
      interestRate: new FormControl(1, {
        validators: [Validators.required, Validators.min(0.1), Validators.max(100)],
      }),
      fromDate: new FormControl(today.toISOString(), {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      calculationType: new FormControl('simple', {
        updateOn: 'change',
        validators: [Validators.required],
      }),
    });
  }

  get formCtrls() {
    return this.recordForm.controls;
  }

  patchForm() {
    this.recordForm.patchValue({
      name: this.editRecord.name,
      mobileNumber: this.editRecord.mobileNumber,
      notes: this.editRecord.notes,
      principal: this.editRecord.principalAmount,
      interestType: this.editRecord.interestType,
      interestRate: this.editRecord.interestRate,
      fromDate: this.editRecord.fromDate,
      calculationType: this.editRecord.calculationType,
      recordType: this.editRecord.type
    });
    if (this.editRecord.calculationType === 'compound') {
      const ctrl = new FormControl(this.editRecord.compoundFrequency, {
        updateOn: 'blur',
        validators: [Validators.required],
      });
      this.recordForm.addControl('interval', ctrl);
    }
  }

  onDateChange(modal: IonModal) {
    modal?.dismiss();
  }

  onClickCancel() {
    this.recordForm.reset();
    this.modalCtrl.dismiss(null);
  }

  onClickCalculate() {
    if (!this.validateForm()) {
      return;
    }
    this.modalCtrl.dismiss({ formData: this.recordForm.value });
  }

  validateForm(): boolean {
    this.recordForm.markAllAsTouched();
    this.recordForm.markAsDirty();
    if (!this.recordForm.valid) {
      return false;
    }
    const formValue = this.recordForm.value;
    this.invalidDatesError =
      new Date(formValue.fromDate) > new Date();
    return !this.invalidDatesError;
  }

}
