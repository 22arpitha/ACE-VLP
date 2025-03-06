import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveHolidayConfigComponent } from './leave-holiday-config.component';

describe('LeaveHolidayConfigComponent', () => {
  let component: LeaveHolidayConfigComponent;
  let fixture: ComponentFixture<LeaveHolidayConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveHolidayConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveHolidayConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
