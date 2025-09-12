import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsSummaryReportComponent } from './timesheets-summary-report.component';

describe('TimesheetsSummaryReportComponent', () => {
  let component: TimesheetsSummaryReportComponent;
  let fixture: ComponentFixture<TimesheetsSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetsSummaryReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
