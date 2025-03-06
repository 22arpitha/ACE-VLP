import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDeleteComponent } from './generic-delete.component';
import { GenericDeleteRoutingModule } from './generic-delete-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    GenericDeleteComponent
  ],
  imports: [
    CommonModule,
    GenericDeleteRoutingModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule
  ],
  exports:[
    GenericDeleteComponent,
    MatButtonModule
  ]
})
export class GenericDeleteModule { }
