import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTimesheetReportsComponent } from './pending-timesheet-reports.component';

describe('PendingTimesheetReportsComponent', () => {
  let component: PendingTimesheetReportsComponent;
  let fixture: ComponentFixture<PendingTimesheetReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingTimesheetReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingTimesheetReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
