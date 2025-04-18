import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkCultureAndWorkEthicsComponent } from './work-culture-and-work-ethics.component';

describe('WorkCultureAndWorkEthicsComponent', () => {
  let component: WorkCultureAndWorkEthicsComponent;
  let fixture: ComponentFixture<WorkCultureAndWorkEthicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkCultureAndWorkEthicsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkCultureAndWorkEthicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
