import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateHolidayComponent } from './create-update-holiday.component';

describe('CreateUpdateHolidayComponent', () => {
  let component: CreateUpdateHolidayComponent;
  let fixture: ComponentFixture<CreateUpdateHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateHolidayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
