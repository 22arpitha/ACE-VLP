import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeWorkingDaysComponent } from './office-working-days.component';

describe('OfficeWorkingDaysComponent', () => {
  let component: OfficeWorkingDaysComponent;
  let fixture: ComponentFixture<OfficeWorkingDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfficeWorkingDaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeWorkingDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
