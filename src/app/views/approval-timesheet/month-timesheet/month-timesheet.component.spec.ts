import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthTimesheetComponent } from './month-timesheet.component';

describe('MonthTimesheetComponent', () => {
  let component: MonthTimesheetComponent;
  let fixture: ComponentFixture<MonthTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthTimesheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
