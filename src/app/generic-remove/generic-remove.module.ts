import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GenericRemoveRoutingModule } from './generic-remove-routing.module';
import { GenericRemoveComponent } from './generic-remove.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    GenericRemoveComponent
  ],
  imports: [
    CommonModule,
    GenericRemoveRoutingModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports:[
    GenericRemoveComponent,
    MatButtonModule
  ]
})
export class GenericRemoveModule { }
