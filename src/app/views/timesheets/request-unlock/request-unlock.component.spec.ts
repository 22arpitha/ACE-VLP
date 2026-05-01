import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestUnlockComponent } from './request-unlock.component';

describe('RequestUnlockComponent', () => {
  let component: RequestUnlockComponent;
  let fixture: ComponentFixture<RequestUnlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestUnlockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestUnlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
