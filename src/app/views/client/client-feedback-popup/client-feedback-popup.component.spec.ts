import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFeedbackPopupComponent } from './client-feedback-popup.component';

describe('ClientFeedbackPopupComponent', () => {
  let component: ClientFeedbackPopupComponent;
  let fixture: ComponentFixture<ClientFeedbackPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientFeedbackPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientFeedbackPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
