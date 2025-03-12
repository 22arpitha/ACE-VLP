import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-generic-edit',
  templateUrl: './generic-edit.component.html',
  styleUrls: ['./generic-edit.component.scss']
})
export class GenericEditComponent implements OnInit {
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input()title:any;
  @Input()message:any;
  
    modalStatus(data){
    this.status.emit(data)
    }
  
  constructor() { }
  

  ngOnInit(): void {
  }

}
