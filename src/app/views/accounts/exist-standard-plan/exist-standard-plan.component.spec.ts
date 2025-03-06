import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistStandardPlanComponent } from './exist-standard-plan.component';

describe('ExistStandardPlanComponent', () => {
  let component: ExistStandardPlanComponent;
  let fixture: ComponentFixture<ExistStandardPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistStandardPlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistStandardPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
