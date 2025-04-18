import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusReportComponent } from './job-status-report.component';

describe('JobStatusReportComponent', () => {
  let component: JobStatusReportComponent;
  let fixture: ComponentFixture<JobStatusReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobStatusReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
