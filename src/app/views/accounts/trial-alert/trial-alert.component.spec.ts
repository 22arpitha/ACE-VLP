import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialAlertComponent } from './trial-alert.component';

describe('TrialAlertComponent', () => {
  let component: TrialAlertComponent;
  let fixture: ComponentFixture<TrialAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrialAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrialAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
