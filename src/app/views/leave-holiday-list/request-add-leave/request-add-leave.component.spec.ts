import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestAddLeaveComponent } from './request-add-leave.component';

describe('RequestAddLeaveComponent', () => {
  let component: RequestAddLeaveComponent;
  let fixture: ComponentFixture<RequestAddLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestAddLeaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestAddLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
