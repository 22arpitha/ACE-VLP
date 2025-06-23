import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkCalendarComponent } from './work-calendar.component';

describe('WorkCalendarComponent', () => {
  let component: WorkCalendarComponent;
  let fixture: ComponentFixture<WorkCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
