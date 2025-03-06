import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetConfiguartionComponent } from './timesheet-configuartion.component';

describe('TimesheetConfiguartionComponent', () => {
  let component: TimesheetConfiguartionComponent;
  let fixture: ComponentFixture<TimesheetConfiguartionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetConfiguartionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetConfiguartionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
