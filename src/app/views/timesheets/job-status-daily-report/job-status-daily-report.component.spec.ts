import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusDailyReportComponent } from './job-status-daily-report.component';

describe('JobStatusDailyReportComponent', () => {
  let component: JobStatusDailyReportComponent;
  let fixture: ComponentFixture<JobStatusDailyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobStatusDailyReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusDailyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
