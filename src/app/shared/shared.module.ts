import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortPipe} from './sort/sort.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GenericNorecardsComponent } from './generic-norecards/generic-norecards.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HypenDirective } from './hypen.directive';
import {MatListModule} from '@angular/material/list';
import {MatBadgeModule} from '@angular/material/badge';
import {MatCardModule } from '@angular/material/card';
import {MatIconModule } from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatNativeDateModule } from '@angular/material/core';
import {MatTabsModule } from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxPaginationModule } from 'ngx-pagination';
import {NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {MatDialogModule} from '@angular/material/dialog';
import {AlphabetOnlyDirective } from './alphabet-only.directive';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { PeriodComponent } from './period/period.component';
import { PeriodicityComponent } from './periodicity/periodicity.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { WeekDatepickerComponent } from './week-datepicker/week-datepicker.component';
import { GenericTableFilterComponent } from './generic-table-filter/generic-table-filter.component';
import { WeekPickerComponent } from './week-picker/week-picker.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { QuarterMonthYearPickerComponent } from './quarter-month-year-picker/quarter-month-year-picker.component';
import { MatOptionModule } from '@angular/material/core';
import { DateFormaterPipe } from './date-formater.pipe';
import { OverlayModule } from '@angular/cdk/overlay';
@NgModule({
  declarations: [
    SortPipe,
    GenericNorecardsComponent,
    HypenDirective,
    AlphabetOnlyDirective,
    DynamicTableComponent,
    PeriodComponent,
    PeriodicityComponent,
    EmployeeListComponent,
    WeekDatepickerComponent,
    GenericTableFilterComponent,
    WeekPickerComponent,
    QuarterMonthYearPickerComponent,
    DateFormaterPipe,
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    DragDropModule,
    MatStepperModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatListModule,
    MatBadgeModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDatepickerModule,
    // MatNativeDateModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgbTooltipModule,
    MatDialogModule,
    NgbDropdownModule,
    OverlayModule
  ],
  exports:[
    AlphabetOnlyDirective,
    SortPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    DragDropModule,
    GenericNorecardsComponent,
    MatStepperModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    HypenDirective,
    MatListModule,
    MatBadgeModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDatepickerModule,
    // MatNativeDateModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgbTooltipModule,
    MatDialogModule,
    DynamicTableComponent,
    EmployeeListComponent,
    PeriodicityComponent,
    WeekDatepickerComponent,
    PeriodComponent,
    GenericTableFilterComponent,
    WeekPickerComponent,
    NgbDropdownModule,
    DateFormaterPipe
   ],

})
export class SharedModule { }
