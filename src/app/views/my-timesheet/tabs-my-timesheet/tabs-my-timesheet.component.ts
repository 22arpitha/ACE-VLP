import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs-my-timesheet',
  templateUrl: './tabs-my-timesheet.component.html',
  styleUrls: ['./tabs-my-timesheet.component.scss']
})
export class TabsMyTimesheetComponent implements OnInit {
  list: any;
  @Input() set data(value){
    this.list = value
   //console.log(this.list)
  }
  get data(){
  return this.list
  }
  constructor() { }

  ngOnInit(): void {
  }

}
