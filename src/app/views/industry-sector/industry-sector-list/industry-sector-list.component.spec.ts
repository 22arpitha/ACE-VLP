import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrySectorListComponent } from './industry-sector-list.component';

describe('IndustrySectorListComponent', () => {
  let component: IndustrySectorListComponent;
  let fixture: ComponentFixture<IndustrySectorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndustrySectorListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndustrySectorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
