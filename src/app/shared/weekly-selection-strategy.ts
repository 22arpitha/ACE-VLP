import { Injectable } from '@angular/core';
import {
  DateRange,
  MatDateRangeSelectionStrategy
} from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';

@Injectable()
export class WeeklySelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this.createWeekRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this.createWeekRange(activeDate);
  }

  private createWeekRange(date: D | null): DateRange<D> {
    if (!date) return new DateRange<D>(null, null);

    const startOfWeek = this._dateAdapter.addCalendarDays(date, -this._dateAdapter.getDayOfWeek(date));
    const endOfWeek = this._dateAdapter.addCalendarDays(startOfWeek, 6);

    return new DateRange<D>(startOfWeek, endOfWeek);
  }
}
