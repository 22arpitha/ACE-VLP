import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveHolidayListComponent } from './leave-holiday-list.component';

describe('LeaveHolidayListComponent', () => {
  let component: LeaveHolidayListComponent;
  let fixture: ComponentFixture<LeaveHolidayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveHolidayListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveHolidayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
