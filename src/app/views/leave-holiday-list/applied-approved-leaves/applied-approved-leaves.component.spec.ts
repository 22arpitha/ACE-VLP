import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliedApprovedLeavesComponent } from './applied-approved-leaves.component';

describe('AppliedApprovedLeavesComponent', () => {
  let component: AppliedApprovedLeavesComponent;
  let fixture: ComponentFixture<AppliedApprovedLeavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppliedApprovedLeavesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppliedApprovedLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
