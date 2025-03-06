import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-transaction-failed',
  templateUrl: './transaction-failed.component.html',
  styleUrls: ['./transaction-failed.component.scss']
})
export class TransactionFailedComponent implements OnInit {
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }
  modalStatus(data) {
    this.status.emit(data)
  }
}
