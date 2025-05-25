import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchRecord',
  standalone: true
})
export class SearchRecordPipe implements PipeTransform {

  transform(records: any[], searchText: string): any[] {
    if (searchText) {
      return records.filter((record) => record.name.toLowerCase().includes(searchText.toLowerCase()));
    } else {
      return records;
    }
  }

}
