import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Holiday } from '../models/wfh.model';
@Injectable({
  providedIn: 'root',
})
export class WfhHolidaysService {
  private holidays: Holiday[] = [];

  constructor() {
    this.initializeHolidays();
  }

  getHolidays(year?: number): Observable<Holiday[]> {
    let filtered = this.holidays;


    if (year) {
      filtered = this.holidays.filter((h) => h.date.getFullYear() === year);
    }

    return of(
      filtered.sort((a, b) => a.date.getTime() - b.date.getTime()),
    ).pipe(delay(200));
  }

  getHolidaysSync(year?: number): Holiday[] {
    let filtered = this.holidays;

    if (year) {
      filtered = this.holidays.filter((h) => h.date.getFullYear() === year);
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getHolidayByDate(date: Date): Observable<Holiday | null> {
    const holiday = this.holidays.find(
      (h) =>
        h.date.getFullYear() === date.getFullYear() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getDate() === date.getDate(),
    );

    return of(holiday || null).pipe(delay(100));
  }

  isHoliday(date: Date): boolean {
    return this.holidays.some(
      (h) =>
        h.date.getFullYear() === date.getFullYear() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getDate() === date.getDate() &&
        !h.isOptional,
    );
  }

  isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = this.isHoliday(date);

    return !isWeekend && !isHoliday;
  }

  addHoliday(holiday: Omit<Holiday, 'id'>): Observable<Holiday> {
    const newHoliday: Holiday = {
      ...holiday,
      id: this.generateId(),
    };

    this.holidays.push(newHoliday);
    return of(newHoliday).pipe(delay(200));
  }

  updateHoliday(id: string, holiday: Partial<Holiday>): Observable<Holiday> {
    const index = this.holidays.findIndex((h) => h.id === id);

    if (index === -1) {
      throw new Error('Holiday not found');
    }

    this.holidays[index] = { ...this.holidays[index], ...holiday };
    return of(this.holidays[index]).pipe(delay(200));
  }

  deleteHoliday(id: string): Observable<boolean> {
    const index = this.holidays.findIndex((h) => h.id === id);

    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.holidays.splice(index, 1);
    return of(true).pipe(delay(200));
  }

  private initializeHolidays(): void {
    const currentYear = new Date().getFullYear();

    // Indian National Holidays for 2026
    this.holidays = [
      {
        id: this.generateId(),
        date: new Date(currentYear, 0, 26), // January 26
        name: 'Republic Day',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 2, 14), // March 14
        name: 'Holi',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 3, 2), // April 2
        name: 'Good Friday',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 3, 10), // April 10
        name: 'Eid ul-Fitr',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 3, 21), // April 21
        name: 'Mahavir Jayanti',
        isNational: false,
        isOptional: true,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 4, 1), // May 1
        name: 'May Day',
        isNational: false,
        isOptional: true,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 4, 23), // May 23
        name: 'Buddha Purnima',
        isNational: false,
        isOptional: true,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 5, 17), // June 17
        name: 'Eid al-Adha',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 7, 15), // August 15
        name: 'Independence Day',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 7, 26), // August 26
        name: 'Janmashtami',
        isNational: false,
        isOptional: true,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 9, 2), // October 2
        name: 'Gandhi Jayanti',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 9, 12), // October 12
        name: 'Dussehra',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 9, 31), // October 31
        name: 'Diwali',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 10, 1), // November 1
        name: 'Diwali (Second Day)',
        isNational: true,
        isOptional: false,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 10, 19), // November 19
        name: 'Guru Nanak Jayanti',
        isNational: false,
        isOptional: true,
      },
      {
        id: this.generateId(),
        date: new Date(currentYear, 11, 25), // December 25
        name: 'Christmas',
        isNational: true,
        isOptional: false,
      },
    ];
  }

  private generateId(): string {
    return 'HOL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
