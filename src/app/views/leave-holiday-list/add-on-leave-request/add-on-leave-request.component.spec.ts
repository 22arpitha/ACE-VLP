import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnLeaveRequestComponent } from './add-on-leave-request.component';

describe('AddOnLeaveRequestComponent', () => {
  let component: AddOnLeaveRequestComponent;
  let fixture: ComponentFixture<AddOnLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnLeaveRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOnLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
