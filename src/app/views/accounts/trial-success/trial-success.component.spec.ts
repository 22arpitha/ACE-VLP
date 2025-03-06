import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialSuccessComponent } from './trial-success.component';

describe('TrialSuccessComponent', () => {
  let component: TrialSuccessComponent;
  let fixture: ComponentFixture<TrialSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrialSuccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrialSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
