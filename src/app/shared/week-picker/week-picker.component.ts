import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY, MatDateRangePicker } from '@angular/material/datepicker';
import { WeeklySelectionStrategy } from '../weekly-selection-strategy';

@Component({
  selector: 'app-week-picker',
  templateUrl: './week-picker.component.html',
  styleUrls: ['./week-picker.component.scss'],
  providers: [
      {
        provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
        useClass: WeeklySelectionStrategy
      }
    ]
})
export class WeekPickerComponent implements OnInit,AfterViewInit  {
  @Output() weekSelected = new EventEmitter<any>();
  @ViewChild('picker1') picker1!: MatDateRangePicker<Date>;
    @Input()resetWeek: boolean = false;
    startDate: Date | null = null;
    endDate: Date | null = null;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
    }
      ngAfterViewInit(): void {
    // Ensure proper change detection so dateClass is recognized
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

dateClass = (date: Date) => {
  return date.getDay() === 0 ? 'sunday-highlight' : '';
};
    ngOnChanges() {
      if (this.resetWeek) {
        this.startDate = null;
        this.endDate = null;
      }
    }

    time={
      start_date:'',
      end_date:''
    }

    onDateChange(event: any) {
      // console.log('satrt date',event)
      this.time.start_date = event.value
    }
    onEndDateChange(event:any){
      // console.log('end date',event);
      this.time.end_date = event.value
      this.weekSelected.emit(this.time);
    }

}
