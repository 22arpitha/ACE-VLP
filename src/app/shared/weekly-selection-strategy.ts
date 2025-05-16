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

    // Make Monday the first day
    const dayOfWeek = this._dateAdapter.getDayOfWeek(date); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const diffToMonday = (dayOfWeek + 6) % 7; // Monday becomes 0, Sunday becomes 6
    const startOfWeek = this._dateAdapter.addCalendarDays(date, -diffToMonday);

    // End on Saturday (5 days after Monday)
    const endOfWeek = this._dateAdapter.addCalendarDays(startOfWeek, 5);

    return new DateRange<D>(startOfWeek, endOfWeek);
  }
}
