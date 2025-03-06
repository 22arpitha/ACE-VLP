import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLeaveDetailsComponent } from './update-leave-details.component';

describe('UpdateLeaveDetailsComponent', () => {
  let component: UpdateLeaveDetailsComponent;
  let fixture: ComponentFixture<UpdateLeaveDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateLeaveDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateLeaveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
