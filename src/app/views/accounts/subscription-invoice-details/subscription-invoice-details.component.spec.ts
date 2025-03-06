import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionInvoiceDetailsComponent } from './subscription-invoice-details.component';

describe('SubscriptionInvoiceDetailsComponent', () => {
  let component: SubscriptionInvoiceDetailsComponent;
  let fixture: ComponentFixture<SubscriptionInvoiceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionInvoiceDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionInvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export { SubscriptionInvoiceDetailsComponent };
