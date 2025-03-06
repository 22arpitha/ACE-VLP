import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotChangeComponent } from './forgot-change.component';

describe('ForgotChangeComponent', () => {
  let component: ForgotChangeComponent;
  let fixture: ComponentFixture<ForgotChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForgotChangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
