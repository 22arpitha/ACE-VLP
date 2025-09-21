import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveTransactionReportComponent } from './leave-transaction-report.component';

describe('LeaveTransactionReportComponent', () => {
  let component: LeaveTransactionReportComponent;
  let fixture: ComponentFixture<LeaveTransactionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveTransactionReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveTransactionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
