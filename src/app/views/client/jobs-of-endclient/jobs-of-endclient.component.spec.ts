import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsOfEndclientComponent } from './jobs-of-endclient.component';

describe('JobsOfEndclientComponent', () => {
  let component: JobsOfEndclientComponent;
  let fixture: ComponentFixture<JobsOfEndclientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsOfEndclientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsOfEndclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
