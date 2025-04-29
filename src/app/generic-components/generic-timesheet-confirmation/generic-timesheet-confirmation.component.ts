import { Component, EventEmitter,Input,OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-timesheet-confirmation',
  templateUrl: './generic-timesheet-confirmation.component.html',
  styleUrls: ['./generic-timesheet-confirmation.component.scss']
})
export class GenericTimesheetConfirmationComponent implements OnInit {

  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input()title:any;
  @Input()message:any;
  @Input()buttonName:any;
    modalStatus(data){
    this.status.emit(data)
    }
    ngOnInit(): void { }
}
