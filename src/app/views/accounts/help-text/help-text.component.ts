import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-help-text',
  templateUrl: './help-text.component.html',
  styleUrls: ['./help-text.component.scss']
})
export class HelpTextComponent implements OnInit {
@Output() status: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }
  modalStatus(data) {
    this.status.emit(data)
  }

}
