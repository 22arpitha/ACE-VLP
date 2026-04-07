import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonProdSummaryComponent } from './non-prod-summary.component';

describe('NonProdSummaryComponent', () => {
  let component: NonProdSummaryComponent;
  let fixture: ComponentFixture<NonProdSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonProdSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonProdSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
