import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-subscription-alert',
  templateUrl: './subscription-alert.component.html',
  styleUrls: ['./subscription-alert.component.scss']
})
export class SubscriptionAlertComponent implements OnInit {
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }
  modalStatus(data){
    
      this.status.emit(data)
  }
}
