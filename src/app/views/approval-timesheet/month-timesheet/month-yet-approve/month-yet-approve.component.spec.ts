import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthYetApproveComponent } from './month-yet-approve.component';

describe('MonthYetApproveComponent', () => {
  let component: MonthYetApproveComponent;
  let fixture: ComponentFixture<MonthYetApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthYetApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthYetApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
