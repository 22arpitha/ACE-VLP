import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetDetailedReportComponent } from './timesheet-detailed-report.component';

describe('TimesheetDetailedReportComponent', () => {
  let component: TimesheetDetailedReportComponent;
  let fixture: ComponentFixture<TimesheetDetailedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetDetailedReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetDetailedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
