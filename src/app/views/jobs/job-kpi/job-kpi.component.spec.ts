import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobKpiComponent } from './job-kpi.component';

describe('JobKpiComponent', () => {
  let component: JobKpiComponent;
  let fixture: ComponentFixture<JobKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobKpiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
