import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-redirection-confirmation',
  templateUrl: './generic-redirection-confirmation.component.html',
  styleUrls: ['./generic-redirection-confirmation.component.scss']
})
export class GenericRedirectionConfirmationComponent implements OnInit {
@Output() status: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }
  modalStatus(data){
  this.status.emit(data)
  }
}
