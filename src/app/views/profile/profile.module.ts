import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
// import { MatIconModule } from '@angular/material/icon';
// import {MatButtonModule} from '@angular/material/button';
// import {MatTooltipModule} from '@angular/material/tooltip';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProfileComponent
],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    // MatIconModule,
    // MatButtonModule,
    // MatTooltipModule,
    SharedModule
  ]
})
export class ProfileModule { }