import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductiveHoursComponent } from './productive-hours.component';

describe('ProductiveHoursComponent', () => {
  let component: ProductiveHoursComponent;
  let fixture: ComponentFixture<ProductiveHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductiveHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductiveHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
