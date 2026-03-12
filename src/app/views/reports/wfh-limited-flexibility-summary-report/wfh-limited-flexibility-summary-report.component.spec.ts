import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhLimitedFlexibilitySummaryReportComponent } from './wfh-limited-flexibility-summary-report.component';

describe('WfhLimitedFlexibilitySummaryReportComponent', () => {
  let component: WfhLimitedFlexibilitySummaryReportComponent;
  let fixture: ComponentFixture<WfhLimitedFlexibilitySummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhLimitedFlexibilitySummaryReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhLimitedFlexibilitySummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
