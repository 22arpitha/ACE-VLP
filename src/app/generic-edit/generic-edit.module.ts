import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericEditRoutingModule } from './generic-edit-routing.module';
import { GenericEditComponent } from './generic-edit.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    GenericEditComponent
  ],
  imports: [
    CommonModule,
    GenericEditRoutingModule,
    MatDialogModule,
    MatButtonModule,
    SharedModule,
  ],
  exports:[
      GenericEditComponent,
      MatButtonModule
    ]
})
export class GenericEditModule { }
