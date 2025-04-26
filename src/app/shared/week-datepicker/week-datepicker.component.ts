import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { WeeklySelectionStrategy } from '../weekly-selection-strategy';

@Component({
  selector: 'app-week-datepicker',
  templateUrl: './week-datepicker.component.html',
  styleUrls: ['./week-datepicker.component.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: WeeklySelectionStrategy
    }
  ]
})
export class WeekDatepickerComponent implements OnInit {
  @Output() weekSelected = new EventEmitter<any>();

  constructor() { }
  
  ngOnInit(): void {
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
