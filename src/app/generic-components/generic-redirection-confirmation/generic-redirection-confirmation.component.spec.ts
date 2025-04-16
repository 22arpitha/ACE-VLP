import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericRedirectionConfirmationComponent } from './generic-redirection-confirmation.component';

describe('GenericRedirectionConfirmationComponent', () => {
  let component: GenericRedirectionConfirmationComponent;
  let fixture: ComponentFixture<GenericRedirectionConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericRedirectionConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericRedirectionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
