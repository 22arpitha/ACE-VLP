import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIndustrySectorComponent } from './create-industry-sector.component';

describe('CreateIndustrySectorComponent', () => {
  let component: CreateIndustrySectorComponent;
  let fixture: ComponentFixture<CreateIndustrySectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateIndustrySectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIndustrySectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
