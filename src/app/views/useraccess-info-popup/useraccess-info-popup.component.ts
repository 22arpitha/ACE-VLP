import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-useraccess-info-popup',
  templateUrl: './useraccess-info-popup.component.html',
  styleUrls: ['./useraccess-info-popup.component.scss']
})
export class UseraccessInfoPopupComponent implements OnInit {
@Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input() data: any;
  modalStatus(data) {
    this.status.emit(data)
  }

  ngOnInit(): void {

  }
}
