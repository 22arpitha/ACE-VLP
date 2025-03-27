import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsOfClientsComponent } from './jobs-of-clients.component';

describe('JobsOfClientsComponent', () => {
  let component: JobsOfClientsComponent;
  let fixture: ComponentFixture<JobsOfClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsOfClientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsOfClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
