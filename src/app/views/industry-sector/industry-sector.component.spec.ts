import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrySectorComponent } from './industry-sector.component';

describe('IndustrySectorComponent', () => {
  let component: IndustrySectorComponent;
  let fixture: ComponentFixture<IndustrySectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndustrySectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndustrySectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
