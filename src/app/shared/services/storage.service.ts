// storage.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Preferences } from '@capacitor/preferences';

import { IBookRecord } from '../modals/interest-book';

const STORAGE_KEY = 'interest_book_app_records';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  //
  private _savedRecords = new BehaviorSubject<IBookRecord[]>([]);

  constructor() {
    this.getAllRecords().then((records) => {
      this._savedRecords.next(records);
      console.log(records);
    });
  }

  get savedRecords() {
    return this._savedRecords.asObservable();
  }

  updateSavedRecords(records: IBookRecord[]) {
    if (!records) {
      this._savedRecords.next([]);
    }
    this._savedRecords.next(records);
  }

  async getAllRecords(): Promise<IBookRecord[]> {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  async addRecord(record: IBookRecord): Promise<IBookRecord[]> {
    const records = await this.getAllRecords();
    records.push(record);
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(records) });
    return records;
  }

  async updateRecord(updated: IBookRecord): Promise<IBookRecord[]> {
    let records = await this.getAllRecords();
    records = records.map((r) => (r.id === updated.id ? updated : r));
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(records) });
    return records;
  }

  async deleteRecord(id: number): Promise<IBookRecord[]> {
    const records = await this.getAllRecords();
    const filtered = records.filter((r) => r.id !== id);
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(filtered),
    });
    return filtered;
  }

  async clearAllRecords(): Promise<IBookRecord[]> {
    await Preferences.remove({ key: STORAGE_KEY });
    return [];
  }
}
