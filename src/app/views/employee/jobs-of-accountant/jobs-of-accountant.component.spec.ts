import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsOfAccountantComponent } from './jobs-of-accountant.component';

describe('JobsOfAccountantComponent', () => {
  let component: JobsOfAccountantComponent;
  let fixture: ComponentFixture<JobsOfAccountantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsOfAccountantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsOfAccountantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
