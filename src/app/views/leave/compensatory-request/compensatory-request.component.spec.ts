import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompensatoryRequestComponent } from './compensatory-request.component';

describe('CompensatoryRequestComponent', () => {
  let component: CompensatoryRequestComponent;
  let fixture: ComponentFixture<CompensatoryRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompensatoryRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompensatoryRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
