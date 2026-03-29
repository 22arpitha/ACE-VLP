import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhProlongedHealthIssuesSummaryReportComponent } from './wfh-prolonged-health-issues-summary-report.component';

describe('WfhProlongedHealthIssuesSummaryReportComponent', () => {
  let component: WfhProlongedHealthIssuesSummaryReportComponent;
  let fixture: ComponentFixture<WfhProlongedHealthIssuesSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhProlongedHealthIssuesSummaryReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhProlongedHealthIssuesSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
