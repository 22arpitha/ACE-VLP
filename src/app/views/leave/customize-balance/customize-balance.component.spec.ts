import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeBalanceComponent } from './customize-balance.component';

describe('CustomizeBalanceComponent', () => {
  let component: CustomizeBalanceComponent;
  let fixture: ComponentFixture<CustomizeBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomizeBalanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomizeBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
