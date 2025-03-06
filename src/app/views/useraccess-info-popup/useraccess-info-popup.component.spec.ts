import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseraccessInfoPopupComponent } from './useraccess-info-popup.component';

describe('UseraccessInfoPopupComponent', () => {
  let component: UseraccessInfoPopupComponent;
  let fixture: ComponentFixture<UseraccessInfoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseraccessInfoPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UseraccessInfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
