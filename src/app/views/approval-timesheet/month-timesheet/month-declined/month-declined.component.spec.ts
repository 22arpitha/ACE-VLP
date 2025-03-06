import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthDeclinedComponent } from './month-declined.component';

describe('MonthDeclinedComponent', () => {
  let component: MonthDeclinedComponent;
  let fixture: ComponentFixture<MonthDeclinedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthDeclinedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthDeclinedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
