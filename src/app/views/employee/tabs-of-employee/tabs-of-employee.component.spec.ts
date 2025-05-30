import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsOfEmployeeComponent } from './tabs-of-employee.component';

describe('TabsOfEmployeeComponent', () => {
  let component: TabsOfEmployeeComponent;
  let fixture: ComponentFixture<TabsOfEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabsOfEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabsOfEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
