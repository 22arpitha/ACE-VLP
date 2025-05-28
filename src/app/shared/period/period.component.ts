import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit,OnChanges {
  peroidslist:any=[];
  @Input() mode: 'Monthly' | 'Quaterly' | 'Yearly'  = 'Monthly';
  @Input() defaultSelection: boolean = false;
  @Input() resetFilterField: boolean = false;
  monthControl = new FormControl('');
  quarterControl = new FormControl('');
  yearControl  = new FormControl('');

  @Output() selectPeriod :EventEmitter<any> = new EventEmitter<any>();
  selectedPeriodVal:{'month_list': string; 'year': string};
  currentDate = new Date();
  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
 
  ngOnChanges(changes: SimpleChanges): void {
   
   if (changes['resetFilterField'] && changes['resetFilterField']?.currentValue === true) {
    this.selectedPeriodVal={
  month_list: '',
  year: ''
};
this.selectPeriod.emit(this.selectedPeriodVal); 
  }
  if(changes['defaultSelection'] && changes['defaultSelection']?.currentValue === true){
    this.defaultSelection = changes['defaultSelection']?.currentValue;
  }

  if(changes['mode'] && changes['mode']?.currentValue !=null){
    this.mode = changes['mode'].currentValue;
    this.selectedPeriodVal={
  month_list: '',
  year: ''
};
this.selectPeriod.emit(this.selectedPeriodVal);
   }
  }
  ngOnInit(): void {

  }

onMonthChange(val: { 'month_list': string; 'year': string }) {
  this.selectedPeriodVal=val;
   this.selectPeriod.emit(this.selectedPeriodVal); 
}

onQuarterChange(val: { 'month_list': string; 'year': string }) {
    this.selectedPeriodVal=val;
    this.selectPeriod.emit(this.selectedPeriodVal); 
}
// Handle year change
  onYearChange(val: { 'month_list': string; 'year': string }) {
      this.selectedPeriodVal=val;
      this.selectPeriod.emit(this.selectedPeriodVal); 
  }

}
