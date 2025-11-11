import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';
@Pipe({
  name: 'dateFormater'
})
export class DateFormaterPipe implements PipeTransform {

  transform(value: any, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';
    try {
      return formatDate(value, format, 'en-IN'); 
    } catch {
      return value;
    }
  }
}
