import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCentersComponent } from './add-centers.component';

describe('AddCentersComponent', () => {
  let component: AddCentersComponent;
  let fixture: ComponentFixture<AddCentersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCentersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
