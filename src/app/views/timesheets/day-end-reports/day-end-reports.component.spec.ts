import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayEndReportsComponent } from './day-end-reports.component';

describe('DayEndReportsComponent', () => {
  let component: DayEndReportsComponent;
  let fixture: ComponentFixture<DayEndReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayEndReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayEndReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
