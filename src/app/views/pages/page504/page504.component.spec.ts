import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page504Component } from './page504.component';

describe('Page504Component', () => {
  let component: Page504Component;
  let fixture: ComponentFixture<Page504Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Page504Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page504Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
