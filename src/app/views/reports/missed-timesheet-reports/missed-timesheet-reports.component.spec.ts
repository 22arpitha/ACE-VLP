import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedTimesheetReportsComponent } from './missed-timesheet-reports.component';

describe('MissedTimesheetReportsComponent', () => {
  let component: MissedTimesheetReportsComponent;
  let fixture: ComponentFixture<MissedTimesheetReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissedTimesheetReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissedTimesheetReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
