import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelLeaveRequestComponent } from './cancel-leave-request.component';

describe('CancelLeaveRequestComponent', () => {
  let component: CancelLeaveRequestComponent;
  let fixture: ComponentFixture<CancelLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelLeaveRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
