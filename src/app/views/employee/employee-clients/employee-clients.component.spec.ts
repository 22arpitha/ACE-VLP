import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeClientsComponent } from './employee-clients.component';

describe('EmployeeClientsComponent', () => {
  let component: EmployeeClientsComponent;
  let fixture: ComponentFixture<EmployeeClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeClientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
