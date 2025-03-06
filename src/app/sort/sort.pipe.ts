import { Pipe, PipeTransform } from '@angular/core';

export type SortOrder = 'asc' | 'desc';

@Pipe({
  name: 'customSort'
})
export class SortPipe implements PipeTransform {

  transform(value: any[], sortOrder: SortOrder | string = 'asc', sortKey?: string): any {
    sortOrder = sortOrder && (sortOrder.toLowerCase() as SortOrder);

    if (!value || (sortOrder !== 'asc' && sortOrder !== 'desc')) {
      return value;
    }

    if (!sortKey) {
      // Handle the case where there is no sort key
      return this.sortArray(value, sortOrder);
    } else {
      // Handle the case where there is a sort key
      return this.sortArrayByKey(value, sortOrder, sortKey);
    }
  }

  private sortArray(array: any[], sortOrder: SortOrder): any[] {
    const sortedArray = array.slice().sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      } else {
        return a.toString().localeCompare(b.toString());
      }
    });
    return sortOrder === 'asc' ? sortedArray : sortedArray.reverse();
  }

  private sortArrayByKey(array: any[], sortOrder: SortOrder, sortKey: string): any[] {
    const sortedArray = array.slice().sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      } else {
        return aValue.toString().localeCompare(bValue.toString());
      }
    });
    return sortOrder === 'asc' ? sortedArray : sortedArray.reverse();
  }
}
