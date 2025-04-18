import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTimeReportsComponent } from './job-time-reports.component';

describe('JobTimeReportsComponent', () => {
  let component: JobTimeReportsComponent;
  let fixture: ComponentFixture<JobTimeReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTimeReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTimeReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
