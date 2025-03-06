import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailPlanDetailsComponent } from './trail-plan-details.component';

describe('TrailPlanDetailsComponent', () => {
  let component: TrailPlanDetailsComponent;
  let fixture: ComponentFixture<TrailPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrailPlanDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrailPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
