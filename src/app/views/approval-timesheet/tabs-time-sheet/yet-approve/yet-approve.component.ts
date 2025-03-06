import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-yet-approve',
  templateUrl: './yet-approve.component.html',
  styleUrls: ['./yet-approve.component.scss']
})
export class YetApproveComponent implements OnInit {
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  status:any;
  action:any;
  term:any='';
  yetToApproveAll:any = [];
  constructor() { }

  ngOnInit(): void {
  }

}
