import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IonModal } from '@ionic/angular';
import {
  calculateInterestWithDates,
  calculateInterestWithDuration,
  IInterestResult,
} from '../utils';
import { StorageService } from '../shared/services/storage.service';
import { IBookRecord } from '../shared/modals/interest-book';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  //
  @ViewChild('saveRecordModal') saveRecordModal!: IonModal;

  calculatorForm: FormGroup;

  interestResult: IInterestResult;
  formValue: any;
  durationError: boolean;
  sameDateError: boolean;
  invalidDatesError: boolean;
  borrowerName: string;
  borrowerCtrlError: string;

  constructor(private storageService: StorageService) {
    this.createForm();
  }

  ngOnInit() {
    this.calculatorForm.controls['tenureType'].valueChanges.subscribe(
      (value: string) => {
        this.modifyDateCtrls(value);
      }
    );
    this.calculatorForm.controls['calculationType'].valueChanges.subscribe(
      (value: string) => {
        if (value === 'compound') {
          const ctrl = new FormControl('yearly', {
            updateOn: 'blur',
            validators: [Validators.required],
          });
          this.calculatorForm.addControl('interval', ctrl);
        } else {
          this.calculatorForm.removeControl('interval');
        }
      }
    );
  }

  ionViewWillEnter() {
    this.onClickCancel();
  }

  createForm() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    this.calculatorForm = new FormGroup({
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
      tenureType: new FormControl('dates', {
        updateOn: 'change',
        validators: [Validators.required],
      }),
      fromDate: new FormControl(yesterday.toISOString(), {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      toDate: new FormControl(today.toISOString(), {
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
    return this.calculatorForm.controls;
  }

  modifyDateCtrls(value: string) {
    if (value === 'dates' && !this.formCtrls['fromDate']) {
      this.calculatorForm.removeControl('years', { emitEvent: false });
      this.calculatorForm.removeControl('months', { emitEvent: false });
      this.calculatorForm.removeControl('days', { emitEvent: false });
      this.calculatorForm.addControl('fromDate', new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }));
      this.calculatorForm.addControl('toDate', new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }));
      return;
    }
    if (value === 'duration' && !this.formCtrls['years']) {
      this.calculatorForm.removeControl('fromDate', { emitEvent: false });
      this.calculatorForm.removeControl('toDate', { emitEvent: false });
      this.calculatorForm.addControl('years', new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
      this.calculatorForm.addControl('months', new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
      this.calculatorForm.addControl('days', new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.maxLength(4), Validators.min(0)],
      }));
    }
  }

  onDateChange(modal: IonModal) {
    modal?.dismiss();
  }

  onClickCancel() {
    this.calculatorForm.reset();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    this.calculatorForm.patchValue({
      interestType: 'rupees',
      interestRate: 1,
      tenureType: 'dates',
      calculationType: 'simple',
      fromDate: yesterday,
      toDate: today,
    });
    this.interestResult = null;
    this.formValue = null;
  }

  onClickCalculate() {
    if (!this.validateForm()) {
      return;
    }
    this.formValue = this.calculatorForm.value;
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
    this.calculatorForm.markAllAsTouched();
    this.calculatorForm.markAsDirty();
    if (!this.calculatorForm.valid) {
      return false;
    }
    const formValue = this.calculatorForm.value;
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

  async onClickSave(modal?: string) {
    if (!modal) {
      this.saveRecordModal.present();
      return;
    }
    this.borrowerCtrlError = null;
    const regex = /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;
    if (!this.borrowerName || this.borrowerName.length === 0) {
      this.borrowerCtrlError = 'Please enter borrower name';
      return;
    } else if (this.borrowerName.length > 50) {
      this.borrowerCtrlError = 'Name cannot be more than 50 characters';
      return;
    } else if (!regex.test(this.borrowerName)) {
      this.borrowerCtrlError = 'Invalid name. Name can only contain alphabets, numbers and space';
      return;
    }
    let data: IBookRecord = {
      id: new Date().getTime(),
      name: this.borrowerName,
      type: 'saved',
      mobileNumber: null,
      interestType: this.formValue.interestType,
      interestRate: this.formValue.interestRate,
      principalAmount: this.formValue.principal,
      calculationType: this.formValue.calculationType,
      compoundFrequency: this.formValue.interval,
      notes: null,
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
      }
    }
    const result = await this.storageService.addRecord(data);
    this.saveRecordModal.dismiss(null, 'save');
    this.storageService.updateSavedRecords(result);
  }

  cancel() {
    this.saveRecordModal.dismiss(null, 'cancel');
  }

  onWillDismiss(event: any) {
    this.borrowerCtrlError = null;
  }
}
