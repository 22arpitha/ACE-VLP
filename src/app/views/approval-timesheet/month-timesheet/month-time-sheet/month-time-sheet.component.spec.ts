import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthTimeSheetComponent } from './month-time-sheet.component';

describe('MonthTimeSheetComponent', () => {
  let component: MonthTimeSheetComponent;
  let fixture: ComponentFixture<MonthTimeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthTimeSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthTimeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
