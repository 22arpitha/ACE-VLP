import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { CreateUpdateJobComponent } from './create-update-job/create-update-job.component';
import { AllJobsComponent } from './all-jobs/all-jobs.component';


@NgModule({
  declarations: [
    JobsComponent,
    CreateUpdateJobComponent,
    AllJobsComponent
  ],
  imports: [
    CommonModule,
    JobsRoutingModule
  ]
})
export class JobsModule { }
