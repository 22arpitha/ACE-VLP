import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysApprovalComponent } from './todays-approval.component';

describe('TodaysApprovalComponent', () => {
  let component: TodaysApprovalComponent;
  let fixture: ComponentFixture<TodaysApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TodaysApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
