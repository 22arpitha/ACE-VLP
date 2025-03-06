import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class ApprovedComponent implements OnInit {
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  approvedon:any;
  approvedby:any;
  status:any;
  action:any;
  term:any='';

  approvedAll:any = [];
  constructor() { }

  ngOnInit(): void {
  }

}
