import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTimeDailyReportComponent } from './job-time-daily-report.component';

describe('JobTimeDailyReportComponent', () => {
  let component: JobTimeDailyReportComponent;
  let fixture: ComponentFixture<JobTimeDailyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTimeDailyReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTimeDailyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
