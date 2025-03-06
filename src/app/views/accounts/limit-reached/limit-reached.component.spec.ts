import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitReachedComponent } from './limit-reached.component';

describe('LimitReachedComponent', () => {
  let component: LimitReachedComponent;
  let fixture: ComponentFixture<LimitReachedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitReachedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitReachedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
