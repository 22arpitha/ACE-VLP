import { Component, EventEmitter,Input,OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-generic-delete',
  templateUrl: './generic-delete.component.html',
  styleUrls: ['./generic-delete.component.scss']
})
export class GenericDeleteComponent implements OnInit {
@Output() status: EventEmitter<any> = new EventEmitter<any>();
@Output() comments: EventEmitter<any> = new EventEmitter<any>();
@Input()title:string;
@Input()message:string;
@Input()bulkAction:string;
declineForm:FormGroup;
constructor(private fb:FormBuilder){}
  
  modalStatus(data) {
    if (data === 'ok' && this.message === 'Decline' && !this.bulkAction) {
      if (this.declineForm.invalid) {
      //  console.log('Form is invalid, stopping execution');
        this.declineForm.markAllAsTouched();
        return; // Stop execution if form is invalid
      }
  
     // console.log('Emitting comments:', this.declineForm.value.comments);
      this.comments.emit(this.declineForm.value.comments); // Emit comments before status
    }
  
    //console.log('Emitting status:', data);
    this.status.emit(data); // Emit status only after handling comments
  }
  
  
  get f(){
    return this.declineForm.controls
  }

  ngOnInit(): void {
    this.initForm()
  }
 initForm(){
  this.declineForm = this.fb.group({
    comments:['',[Validators.required,Validators.pattern(/^\S.*/)]]
  })
 }
}
