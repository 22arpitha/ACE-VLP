import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrganizationWorkingHoursComponent } from './create-organization-working-hours.component';

describe('CreateOrganizationWorkingHoursComponent', () => {
  let component: CreateOrganizationWorkingHoursComponent;
  let fixture: ComponentFixture<CreateOrganizationWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrganizationWorkingHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
