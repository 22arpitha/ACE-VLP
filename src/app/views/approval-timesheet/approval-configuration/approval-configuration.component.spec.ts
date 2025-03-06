import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalConfigurationComponent } from './approval-configuration.component';

describe('ApprovalConfigurationComponent', () => {
  let component: ApprovalConfigurationComponent;
  let fixture: ComponentFixture<ApprovalConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
