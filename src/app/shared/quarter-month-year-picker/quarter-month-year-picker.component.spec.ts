import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterMonthYearPickerComponent } from './quarter-month-year-picker.component';

describe('QuarterMonthYearPickerComponent', () => {
  let component: QuarterMonthYearPickerComponent;
  let fixture: ComponentFixture<QuarterMonthYearPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuarterMonthYearPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuarterMonthYearPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
