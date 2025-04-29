import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTimesheetConfirmationComponent } from './generic-timesheet-confirmation.component';

describe('GenericTimesheetConfirmationComponent', () => {
  let component: GenericTimesheetConfirmationComponent;
  let fixture: ComponentFixture<GenericTimesheetConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericTimesheetConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericTimesheetConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
