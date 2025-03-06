import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-trial-success',
  templateUrl: './trial-success.component.html',
  styleUrls: ['./trial-success.component.scss']
})
export class TrialSuccessComponent implements OnInit {
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
