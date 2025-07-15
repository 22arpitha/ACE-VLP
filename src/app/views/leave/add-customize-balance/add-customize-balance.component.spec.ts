import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomizeBalanceComponent } from './add-customize-balance.component';

describe('AddCustomizeBalanceComponent', () => {
  let component: AddCustomizeBalanceComponent;
  let fixture: ComponentFixture<AddCustomizeBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomizeBalanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCustomizeBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
