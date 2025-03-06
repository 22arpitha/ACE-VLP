import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.scss']
})
export class TimeSheetComponent implements OnInit {
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  rejectedon:any;
  rejectedby:any;
  status:any;
  action:any;
  term:any='';
  
  timesheetDataAll:any = []
  constructor() { }

  ngOnInit(): void {
  }

}
