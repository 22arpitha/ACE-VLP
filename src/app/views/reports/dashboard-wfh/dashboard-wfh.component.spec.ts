import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWfhComponent } from './dashboard-wfh.component';

describe('DashboardWfhComponent', () => {
  let component: DashboardWfhComponent;
  let fixture: ComponentFixture<DashboardWfhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardWfhComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardWfhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
