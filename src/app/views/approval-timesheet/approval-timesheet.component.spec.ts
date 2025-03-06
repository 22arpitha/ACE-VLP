import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalTimesheetComponent } from './approval-timesheet.component';

describe('ApprovalTimesheetComponent', () => {
  let component: ApprovalTimesheetComponent;
  let fixture: ComponentFixture<ApprovalTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalTimesheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
