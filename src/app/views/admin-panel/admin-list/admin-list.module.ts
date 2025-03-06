import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminListComponent } from './admin-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { AdminListRoutingModule } from './admin-list-routing.module';
@NgModule({
    declarations: [
     AdminListComponent
    ],
    imports:[
        CommonModule,
        SharedModule,
        AdminListRoutingModule
    ]
})
export class AdminListModule { }