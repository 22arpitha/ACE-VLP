import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantitativeProductivityComponent } from './quantitative-productivity.component';

describe('QuantitativeProductivityComponent', () => {
  let component: QuantitativeProductivityComponent;
  let fixture: ComponentFixture<QuantitativeProductivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantitativeProductivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantitativeProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
