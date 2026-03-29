import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhProlongedHealthIssuesTransactionReportComponent } from './wfh-prolonged-health-issues-transaction-report.component';

describe('WfhProlongedHealthIssuesTransactionReportComponent', () => {
  let component: WfhProlongedHealthIssuesTransactionReportComponent;
  let fixture: ComponentFixture<WfhProlongedHealthIssuesTransactionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhProlongedHealthIssuesTransactionReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhProlongedHealthIssuesTransactionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
