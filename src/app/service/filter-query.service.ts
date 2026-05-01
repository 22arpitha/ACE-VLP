import { Injectable } from '@angular/core';

export interface IdNamePair {
  id: any;
  name: string;
}

export interface FilterState {
  selectAllValue: boolean | null;
  selectedOptions: IdNamePair[];
  excludedIds: IdNamePair[];
  selectedCount: number;
}

@Injectable({ providedIn: 'root' })
export class FilterQueryService {

  private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map((x: any) => x.id).join(',');
  }

  /**
   * Builds a URL query segment from a FilterState.
   *
   * @param filterState  The FilterState object (selectAllValue / selectedOptions / excludedIds)
   * @param baseParam    Base URL param name e.g. 'client', 'employee', 'status-group'
   *                     The suffix `-ids` is appended automatically.
   *
   * Examples (baseParam = 'client'):
   *   null   → &client-ids=[1,2,3]
   *   true   → &client-ids-all=true
   *   false  → &client-ids-all=true&client-ids-excluded=[4,5]
   */
  buildFilterSegment(filterState: FilterState | any, baseParam: string): string {
    if (!filterState) return '';
    const { selectAllValue, selectedOptions, excludedIds } = filterState;

    if (selectAllValue === null || selectAllValue === undefined) {
      if (!selectedOptions?.length) return '';
      return `&${baseParam}-ids=[${this.ids(selectedOptions)}]`;
    } else if (selectAllValue === true) {
      return `&${baseParam}-ids-all=true`;
    } else if (selectAllValue === false) {
      if (!excludedIds?.length) return '';
      return `&${baseParam}-ids-all=true&${baseParam}-ids-excluded=[${this.ids(excludedIds)}]`;
    }
    return '';
  }
}
