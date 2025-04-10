import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateTimesheetComponent } from './create-update-timesheet.component';

describe('CreateUpdateTimesheetComponent', () => {
  let component: CreateUpdateTimesheetComponent;
  let fixture: ComponentFixture<CreateUpdateTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateTimesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
