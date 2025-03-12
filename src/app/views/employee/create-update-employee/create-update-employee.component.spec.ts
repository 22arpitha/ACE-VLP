import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateEmployeeComponent } from './create-update-employee.component';

describe('CreateUpdateEmployeeComponent', () => {
  let component: CreateUpdateEmployeeComponent;
  let fixture: ComponentFixture<CreateUpdateEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
