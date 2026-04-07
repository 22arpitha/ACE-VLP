import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItIssueReportsComponent } from './it-issue-reports.component';

describe('ItIssueReportsComponent', () => {
  let component: ItIssueReportsComponent;
  let fixture: ComponentFixture<ItIssueReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItIssueReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItIssueReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
