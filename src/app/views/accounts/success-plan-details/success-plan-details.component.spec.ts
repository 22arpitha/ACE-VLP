import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPlanDetailsComponent } from './success-plan-details.component';

describe('SuccessPlanDetailsComponent', () => {
  let component: SuccessPlanDetailsComponent;
  let fixture: ComponentFixture<SuccessPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessPlanDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
