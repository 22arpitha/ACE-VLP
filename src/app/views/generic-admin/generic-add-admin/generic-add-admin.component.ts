import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-generic-add-admin',
  templateUrl: './generic-add-admin.component.html',
  styleUrls: ['./generic-add-admin.component.scss']
})
export class GenericAddAdminComponent implements OnInit {
  @Input() adminFormGroup!: FormGroup; // FormGroup for the admin
  @Input() isEditing = false;         // Editing state
  @Input() index!: number;            // Index for operations

  @Output() save = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  adminForm: FormGroup<any>;

  onSave() {
    this.save.emit(this.index);
  }
 
 
  ngOnChanges(){
    this.adminForm = this.adminFormGroup
  }
  onCancel() {
    this.cancel.emit(this.index);
  }

  onDelete() {
    this.delete.emit(this.index);
  }

  onEdit() {
    this.edit.emit(this.index);
  }
  constructor() { }

  ngOnInit(): void {
  }
  toggleFormControlState(i,){}
}
