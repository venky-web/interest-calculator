import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IonModal, ModalController } from '@ionic/angular';

import { ISavedRecord } from 'src/app/shared/modals/interest-book';
import { calculateInterestWithDates, calculateInterestWithDuration, IInterestResult } from 'src/app/utils';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.scss'],
})
export class EditRecordComponent implements OnInit {
  //
  @Input() editRecord: ISavedRecord;

  recordForm: FormGroup;

  interestResult: IInterestResult;
  formValue: any;
  durationError: boolean;
  sameDateError: boolean;
  invalidDatesError: boolean;

  constructor(private modalCtrl: ModalController) {
  }
  
  ngOnInit() {
    this.createForm();
    this.recordForm.controls['tenureType'].valueChanges.subscribe(
      (value: string) => {
        this.modifyDateCtrls(value);
      }
    );
    this.recordForm.controls['calculationType'].valueChanges.subscribe(
      (value: string) => {
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
    this.onClickCalculate();
    console.log(this.editRecord);
  }

  ionViewWillEnter() {
    // this.onClickCancel();
  }

  createForm() {
    this.recordForm = new FormGroup({
      name: new FormControl(this.editRecord.name, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/)],
      }),
      principal: new FormControl(this.editRecord.principalAmount, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.max(1000000000000)],
      }),
      interestType: new FormControl(this.editRecord.interestType, {
        updateOn: 'change',
        validators: [Validators.required],
      }),
      interestRate: new FormControl(this.editRecord.interestRate, {
        validators: [Validators.required, Validators.min(0.1), Validators.max(100)],
      }),
      tenureType: new FormControl(this.editRecord.tenureType, {
        updateOn: 'change',
        validators: [Validators.required],
      }),
      calculationType: new FormControl(this.editRecord.calculationType, {
        updateOn: 'change',
        validators: [Validators.required],
      }),
    });
    this.patchAdditionalFormCtrls();
  }

  get formCtrls() {
    return this.recordForm.controls;
  }

  patchAdditionalFormCtrls() {
    if (this.editRecord.tenureType === 'dates') {
      this.recordForm.addControl('fromDate', new FormControl(this.editRecord.fromDate, {
        updateOn: 'blur',
        validators: [Validators.required],
      }));
      this.recordForm.addControl('toDate', new FormControl(this.editRecord.toDate, {
        updateOn: 'blur',
        validators: [Validators.required],
      }));
    } else {
      this.recordForm.addControl('years', new FormControl(this.editRecord.years, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
      this.recordForm.addControl('months', new FormControl(this.editRecord.months, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
      this.recordForm.addControl('days', new FormControl(this.editRecord.days, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
    }
    if (this.editRecord.calculationType === 'compound') {
      const ctrl = new FormControl(this.editRecord.compoundFrequency, {
        updateOn: 'blur',
        validators: [Validators.required],
      });
      this.recordForm.addControl('interval', ctrl);
    }
  }

  modifyDateCtrls(value: string) {
    if (value === 'dates' && !this.formCtrls['fromDate']) {
      this.recordForm.removeControl('years', { emitEvent: false });
      this.recordForm.removeControl('months', { emitEvent: false });
      this.recordForm.removeControl('days', { emitEvent: false });
      this.recordForm.addControl('fromDate', new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }));
      this.recordForm.addControl('toDate', new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }));
      return;
    }
    if (value === 'duration' && !this.formCtrls['years']) {
      this.recordForm.removeControl('fromDate', { emitEvent: false });
      this.recordForm.removeControl('toDate', { emitEvent: false });
      this.recordForm.addControl('years', new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
      this.recordForm.addControl('months', new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
      this.recordForm.addControl('days', new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
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
    this.formValue = this.recordForm.value;
    let interestRate = this.formValue.interestRate;
    if (this.formValue.interestType === 'rupees') {
      interestRate = interestRate * 12;
    }
    if (this.formValue.tenureType === 'dates') {
      this.interestResult = calculateInterestWithDates({
        principal: this.formValue.principal,
        rate: interestRate,
        interestType: this.formValue.calculationType,
        compoundFrequency: this.formValue.interval,
        startDate: this.formValue.fromDate,
        endDate: this.formValue.toDate,
      });
    } else {
      this.interestResult = calculateInterestWithDuration({
        principal: this.formValue.principal,
        rate: interestRate,
        interestType: this.formValue.calculationType,
        compoundFrequency: this.formValue.interval,
        years: this.formValue.years || 0,
        months: this.formValue.months || 0,
        days: this.formValue.days || 0,
      });
    }
  }

  validateForm(): boolean {
    this.recordForm.markAllAsTouched();
    this.recordForm.markAsDirty();
    if (!this.recordForm.valid) {
      return false;
    }
    const formValue = this.recordForm.value;
    if (formValue.tenureType === 'dates') {
      this.sameDateError =
        new Date(formValue.fromDate).toLocaleDateString() ===
        new Date(formValue.toDate).toLocaleDateString();
      this.invalidDatesError =
        new Date(formValue.fromDate) > new Date(formValue.toDate);
      return !this.sameDateError && !this.invalidDatesError;
    }
    this.durationError =
      (!formValue.years || formValue.years === 0) &&
      (!formValue.months || formValue.months === 0) &&
      (!formValue.days || formValue.days === 0);
    return !this.durationError;
  }

  async onClickSave() {
    if (!this.validateForm()) {
      return;
    }
    let data: ISavedRecord = {
      id: this.editRecord.id,
      name: this.formValue.name,
      type: this.editRecord.type,
      mobileNumber: this.editRecord.mobileNumber,
      interestType: this.formValue.interestType,
      interestRate: this.formValue.interestRate,
      principalAmount: this.formValue.principal,
      calculationType: this.formValue.calculationType,
      compoundFrequency: this.formValue.interval,
      notes: this.editRecord.notes,
      tenureType: this.formValue.tenureType,
    };
    if (this.formValue.tenureType === 'dates') {
      data = {
        ...data,
        fromDate: this.formValue.fromDate,
        toDate: this.formValue.toDate,
      };
    } else {
      data = {
        ...data,
        years: this.formValue.years,
        months: this.formValue.months,
        days: this.formValue.days,
      };
    }
    await this.modalCtrl.dismiss({ updatedRecord: data });
  }
}
