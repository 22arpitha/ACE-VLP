import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveConfigurationComponent } from './leave-configuration.component';

describe('LeaveConfigurationComponent', () => {
  let component: LeaveConfigurationComponent;
  let fixture: ComponentFixture<LeaveConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
