import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableCalendarComponent } from './generic-table-calendar.component';

describe('GenericTableCalendarComponent', () => {
  let component: GenericTableCalendarComponent;
  let fixture: ComponentFixture<GenericTableCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericTableCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericTableCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
