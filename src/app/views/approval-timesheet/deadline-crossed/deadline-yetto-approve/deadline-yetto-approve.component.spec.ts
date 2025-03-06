import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlineYettoApproveComponent } from './deadline-yetto-approve.component';

describe('DeadlineYettoApproveComponent', () => {
  let component: DeadlineYettoApproveComponent;
  let fixture: ComponentFixture<DeadlineYettoApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeadlineYettoApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeadlineYettoApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
