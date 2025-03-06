import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cancel-subscription',
  templateUrl: './cancel-subscription.component.html',
  styleUrls: ['./cancel-subscription.component.scss']
})
export class CancelSubscriptionComponent implements OnInit {
@Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input()title:any;
  @Input()subtitle:any;
  @Input()message:any;
    
  modalStatus(data){
    this.status.emit(data)
    }
  
    ngOnInit(): void {
     
    }
}
