import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-welcome-msg',
  templateUrl: './user-welcome-msg.component.html',
  styleUrls: ['./user-welcome-msg.component.scss']
})
export class UserWelcomeMsgComponent implements OnInit {
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input() data: any;
  modalStatus(data) {
    this.status.emit(data)
  }

  ngOnInit(): void {

  }
}
