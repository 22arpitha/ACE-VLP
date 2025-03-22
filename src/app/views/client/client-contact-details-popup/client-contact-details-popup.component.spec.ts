import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientContactDetailsPopupComponent } from './client-contact-details-popup.component';

describe('ClientContactDetailsPopupComponent', () => {
  let component: ClientContactDetailsPopupComponent;
  let fixture: ComponentFixture<ClientContactDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientContactDetailsPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientContactDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
