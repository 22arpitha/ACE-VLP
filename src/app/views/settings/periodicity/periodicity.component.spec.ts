import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicityComponent } from './periodicity.component';

describe('PeriodicityComponent', () => {
  let component: PeriodicityComponent;
  let fixture: ComponentFixture<PeriodicityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodicityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodicityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
