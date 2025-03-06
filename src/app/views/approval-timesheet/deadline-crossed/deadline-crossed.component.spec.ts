import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlineCrossedComponent } from './deadline-crossed.component';

describe('DeadlineCrossedComponent', () => {
  let component: DeadlineCrossedComponent;
  let fixture: ComponentFixture<DeadlineCrossedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeadlineCrossedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeadlineCrossedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
