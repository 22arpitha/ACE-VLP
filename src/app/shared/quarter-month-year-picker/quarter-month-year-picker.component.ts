import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-quarter-month-year-picker',
  templateUrl: './quarter-month-year-picker.component.html',
  styleUrls: ['./quarter-month-year-picker.component.scss']
})

export class QuarterMonthYearPickerComponent implements OnInit {
  @Input() mode: 'Monthly' | 'Quaterly' | 'Yearly' = 'Monthly';
  @Input() defaultSelectPreviousMonth: boolean = false;
  @Input() control = new FormControl('');
  @Output() valueChange = new EventEmitter<{ year: string; month_list: string }>();
  @ViewChild('trigger') menuTrigger!: MatMenuTrigger;
  showSelection = true;
  year: number = new Date().getFullYear();
  yearDefault = new Date().getFullYear();
  yearRangeStart: number;
  selectedMonth: string | null = null;
  selectedQuarter: string | null = null;

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  quarters: { value: string; months: string[] }[] = [
    { value: 'Q1', months: ['January', 'February', 'March'] },
    { value: 'Q2', months: ['April', 'May', 'June'] },
    { value: 'Q3', months: ['July', 'August', 'September'] },
    { value: 'Q4', months: ['October', 'November', 'December'] }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.yearRangeStart = this.yearDefault - (this.yearDefault % 10);

    if (this.defaultSelectPreviousMonth) {
      const now = new Date();
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);

      const prevMonth = this.months[prevMonthDate.getMonth()];
      const prevYear = prevMonthDate.getFullYear();

      this.year = prevYear;

      if (this.mode === 'Monthly') {
        this.selectedMonth = prevMonth;
        this.emitValue(prevMonth);
      } else if (this.mode === 'Quaterly') {
        const quarter = this.quarters.find(q => q.months.includes(prevMonth));
        if (quarter) {
          this.selectedQuarter = quarter.value;
          this.emitValue(quarter.value);
        }
      } else if (this.mode === 'Yearly') {
        this.emitValue(prevYear.toString());
      }
    }

    this.control.valueChanges.subscribe((val: any) => {
      this.parseInput(val);
    });
  }

  parseInput(val: string) {
    val = (val || '').toUpperCase().trim();

    if (this.mode === 'Quaterly') {
      const match = val.match(/^Q([1-4])\s*(\d{4})?$/);
      if (match) {
        this.selectedQuarter = `Q${match[1]}`;
        this.year = +match[2] || this.year;
        this.emitValue(this.selectedQuarter);
      }
    } else if (this.mode === 'Monthly') {
      const match = val.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})?$/i);
      if (match) {
        this.selectedMonth = match[1];
        this.year = +match[2] || this.year;
        this.emitValue(this.selectedMonth);
      }
    } else if (this.mode === 'Yearly') {
      const match = val.match(/^\d{4}$/);
      if (match) {
        this.year = +match[0];
        this.emitValue(this.year.toString());
      }
    }
  }

  emitValue(period: string) {
    if (!this.year) return;
    console.log('period',period,'year',this.year);
    if (this.mode !== 'Yearly') {
      const newVal = `${period} ${this.year}`;
    this.control.setValue(newVal, { emitEvent: false });
    } else {
    const newVal = `${this.year}`;
    this.control.setValue(newVal, { emitEvent: false });
    }
    
    let monthList: string[] = [];

    if (this.mode === 'Quaterly') {
      const quarter = this.quarters.find(q => q.value === period);
      if (quarter) {
        monthList = quarter.months;
      }
    } else if (this.mode === 'Monthly') {
      monthList = [period];
    }

    const payload = {
      year: this.year.toString(),
      month_list: JSON.stringify(monthList).replace(/"/g, "'")
    };

    this.valueChange.emit(payload);
    this.cdr.detectChanges();
  }

  finalSelectionMade(): boolean {
    if (this.mode === 'Monthly') {
      return !!this.selectedMonth && !!this.year;
    }
    if (this.mode === 'Quaterly') {
      return !!this.selectedQuarter && !!this.year;
    }
    if (this.mode === 'Yearly') {
      return !!this.year;
    }
    return false;
  }

  select(period: string) {
    if (this.mode === 'Monthly') {
      this.selectedMonth = period;
    } else if (this.mode === 'Quaterly') {
      this.selectedQuarter = period;
    }

    if (this.finalSelectionMade()) {
      this.emitValue(period);
      this.showSelection = true;
      this.menuTrigger?.closeMenu();
    } else {
      this.showSelection = true;
    }
  }

  changeYear(val: number) {
    this.year = val;

    const currentPeriod =
      this.mode === 'Monthly' ? this.selectedMonth :
      this.mode === 'Quaterly' ? this.selectedQuarter :
      this.year.toString();

    if (this.finalSelectionMade()) {
      this.emitValue(currentPeriod || '');
      this.showSelection = true;
      this.menuTrigger?.closeMenu();
    } else {
      this.showSelection = true;
    }
  }

  toggleView() {
    this.showSelection = !this.showSelection;
  }

  prevDecade() {
    this.yearRangeStart -= 10;
    this.showSelection = false;
    this.cdr.detectChanges();
  }

  nextDecade() {
    this.yearRangeStart += 10;
    this.showSelection = false;
    this.cdr.detectChanges();
  }
}

