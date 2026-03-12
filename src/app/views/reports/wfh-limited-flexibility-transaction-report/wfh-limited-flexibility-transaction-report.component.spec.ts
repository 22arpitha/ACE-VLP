import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhLimitedFlexibilityTransactionReportComponent } from './wfh-limited-flexibility-transaction-report.component';

describe('WfhLimitedFlexibilityTransactionReportComponent', () => {
  let component: WfhLimitedFlexibilityTransactionReportComponent;
  let fixture: ComponentFixture<WfhLimitedFlexibilityTransactionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhLimitedFlexibilityTransactionReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhLimitedFlexibilityTransactionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
