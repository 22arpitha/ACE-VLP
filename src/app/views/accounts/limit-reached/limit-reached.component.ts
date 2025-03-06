import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-limit-reached',
  templateUrl: './limit-reached.component.html',
  styleUrls: ['./limit-reached.component.scss']
})
export class LimitReachedComponent implements OnInit {

   @Output() status: EventEmitter<any> = new EventEmitter<any>();
   constructor() { }
 
   ngOnInit(): void {
   }
   modalStatus(data){
     
       this.status.emit(data)
   }

}
