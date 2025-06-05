import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatedJobKpiComponent } from './updated-job-kpi.component';

describe('UpdatedJobKpiComponent', () => {
  let component: UpdatedJobKpiComponent;
  let fixture: ComponentFixture<UpdatedJobKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatedJobKpiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatedJobKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
