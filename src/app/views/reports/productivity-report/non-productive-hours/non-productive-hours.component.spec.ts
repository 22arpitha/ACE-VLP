import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonProductiveHoursComponent } from './non-productive-hours.component';

describe('NonProductiveHoursComponent', () => {
  let component: NonProductiveHoursComponent;
  let fixture: ComponentFixture<NonProductiveHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonProductiveHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonProductiveHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
