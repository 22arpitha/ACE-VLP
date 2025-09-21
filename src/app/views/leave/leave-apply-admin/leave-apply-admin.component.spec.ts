import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveApplyAdminComponent } from './leave-apply-admin.component';

describe('LeaveApplyAdminComponent', () => {
  let component: LeaveApplyAdminComponent;
  let fixture: ComponentFixture<LeaveApplyAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveApplyAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveApplyAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
