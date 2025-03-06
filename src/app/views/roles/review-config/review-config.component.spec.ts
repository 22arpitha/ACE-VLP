import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewConfigComponent } from './review-config.component';

describe('ReviewConfigComponent', () => {
  let component: ReviewConfigComponent;
  let fixture: ComponentFixture<ReviewConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
