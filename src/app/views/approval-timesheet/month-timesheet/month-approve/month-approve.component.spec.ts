import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthApproveComponent } from './month-approve.component';

describe('MonthApproveComponent', () => {
  let component: MonthApproveComponent;
  let fixture: ComponentFixture<MonthApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
