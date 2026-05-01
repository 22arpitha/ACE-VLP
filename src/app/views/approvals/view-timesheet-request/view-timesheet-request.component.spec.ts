import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTimesheetRequestComponent } from './view-timesheet-request.component';

describe('ViewTimesheetRequestComponent', () => {
  let component: ViewTimesheetRequestComponent;
  let fixture: ComponentFixture<ViewTimesheetRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTimesheetRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTimesheetRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
