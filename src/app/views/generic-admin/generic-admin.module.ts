import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../generic-admin/pagination/pagination.component';
import { SearchComponent } from '../generic-admin/search/search.component';
import { GenericAdminRoutingModule } from './generic-admin-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { GenericAdminListComponent } from './generic-admin-list/generic-admin-list.component';
import { SharedModule } from '../../shared/shared.module';
@NgModule({
    declarations: [
    GenericAdminListComponent,
    PaginationComponent,
    SearchComponent,
    GenericAdminListComponent
    ],
    imports: [
      CommonModule,
      GenericAdminRoutingModule,
      NgxPaginationModule,
      SharedModule
    ],
    exports:[
    GenericAdminListComponent,
    PaginationComponent,
    SearchComponent
    ]
  })
  export class GenericAdminModule { }