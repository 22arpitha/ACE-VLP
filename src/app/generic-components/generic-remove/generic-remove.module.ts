import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericRemoveRoutingModule } from './generic-remove-routing.module';
import { GenericRemoveComponent } from './generic-remove.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    GenericRemoveComponent
  ],
  imports: [
    CommonModule,
    GenericRemoveRoutingModule,
    SharedModule
  ],
  exports:[
    GenericRemoveComponent
  ]
})
export class GenericRemoveModule { }
