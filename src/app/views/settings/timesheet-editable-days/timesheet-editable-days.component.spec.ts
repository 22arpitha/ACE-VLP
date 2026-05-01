import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetEditableDaysComponent } from './timesheet-editable-days.component';

describe('TimesheetEditableDaysComponent', () => {
  let component: TimesheetEditableDaysComponent;
  let fixture: ComponentFixture<TimesheetEditableDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetEditableDaysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetEditableDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
