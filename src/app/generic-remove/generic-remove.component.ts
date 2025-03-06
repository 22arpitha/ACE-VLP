import { Component, EventEmitter,Input,OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-remove',
  templateUrl: './generic-remove.component.html',
  styleUrls: ['./generic-remove.component.scss']
})
export class GenericRemoveComponent implements OnInit {
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input()title:any;
  @Input()message:any;
    modalStatus(data){
    this.status.emit(data)
    }
  
    ngOnInit(): void {
     
    }
}
