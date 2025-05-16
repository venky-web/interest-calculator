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

    // Split integer and decimal
    const [integerPart, decimalPart] = amount.split('.');
    let lastThree = integerPart.slice(-3);
    let otherNumbers = integerPart.slice(0, -3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    return `₹ ${formattedInteger}.${decimalPart}`;
  }
}
