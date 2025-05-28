import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
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
export class WeekPickerComponent implements OnInit {
  @Output() weekSelected = new EventEmitter<any>();
    @Input()resetWeek: boolean = false;
    startDate: Date | null = null;
    endDate: Date | null = null;

    constructor() { }

    ngOnInit(): void {
    }
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
