import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentConfigComponent } from './department-config.component';

describe('DepartmentConfigComponent', () => {
  let component: DepartmentConfigComponent;
  let fixture: ComponentFixture<DepartmentConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmentConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
