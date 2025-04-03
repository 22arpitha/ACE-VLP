import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { CreateUpdateJobComponent } from './create-update-job/create-update-job.component';
import { AllJobsComponent } from './all-jobs/all-jobs.component';
import { NgxEditorModule } from 'ngx-editor';
import { JobKpiComponent } from './job-kpi/job-kpi.component';




@NgModule({
  declarations: [
    JobsComponent,
    CreateUpdateJobComponent,
    AllJobsComponent,
    JobKpiComponent
  ],
  imports: [
    CommonModule,
    JobsRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
        NgxEditorModule.forRoot({
          locals: {
            // menu
            bold: 'Bold',
            italic: 'Italic',
            code: 'Code',
            blockquote: 'Blockquote',
            underline: 'Underline',
            strike: 'Strike',
            bullet_list: 'Bullet List',
            ordered_list: 'Ordered List',
            heading: 'Heading',
            h1: 'Header 1',
            h2: 'Header 2',
            h3: 'Header 3',
            h4: 'Header 4',
            h5: 'Header 5',
            h6: 'Header 6',
            align_left: 'Left Align',
            align_center: 'Center Align',
            align_right: 'Right Align',
            align_justify: 'Justify',
            text_color: 'Text Color',
            background_color: 'Background Color',
    
            // popups, forms, others...
            url: 'URL',
            text: 'Text',
            openInNewTab: 'Open in new tab',
            insert: 'Insert',
            altText: 'Alt Text',
            title: 'Title',
            remove: 'Remove',
            enterValidUrl: 'Please enter a valid URL',
          },
    }),
    SharedModule,
  ]
})
export class JobsModule { }
