import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class AppCurrencyPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null || isNaN(Number(value))) {
      return '₹ 0.00'
    };

    const amount = Number(value).toFixed(2);
    let formatted = '';
    let suffix = '';

    if (Number(amount) >= 1_00_00_000 || Number(amount) <= -1_00_00_000) {
      // Crores
      formatted = (Number(amount) / 1_00_00_000).toFixed(2);
      suffix = ' Cr';
    } else if (Number(amount) >= 1_00_000 || Number(amount) <= -1_00_000) {
      // Lakhs
      formatted = (Number(amount) / 1_00_000).toFixed(2);
      suffix = ' L';
    } else {
      // Standard Indian comma formatting
      const [intPart, decimalPart] = amount.split('.');
      let lastThree = intPart.slice(-3);
      let otherNumbers = intPart.slice(0, -3);

      if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
      }

      const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
      formatted = `${formattedInt}.${decimalPart}`;
    }

    return `₹ ${formatted}${suffix}`;
  }
}
