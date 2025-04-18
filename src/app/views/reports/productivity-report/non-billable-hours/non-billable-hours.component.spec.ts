import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonBillableHoursComponent } from './non-billable-hours.component';

describe('NonBillableHoursComponent', () => {
  let component: NonBillableHoursComponent;
  let fixture: ComponentFixture<NonBillableHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonBillableHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonBillableHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
