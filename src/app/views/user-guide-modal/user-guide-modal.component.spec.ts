import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGuideModalComponent } from './user-guide-modal.component';

describe('UserGuideModalComponent', () => {
  let component: UserGuideModalComponent;
  let fixture: ComponentFixture<UserGuideModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserGuideModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGuideModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
