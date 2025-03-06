import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionConfigComponent } from './subscription-config.component';

describe('SubscriptionConfigComponent', () => {
  let component: SubscriptionConfigComponent;
  let fixture: ComponentFixture<SubscriptionConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
