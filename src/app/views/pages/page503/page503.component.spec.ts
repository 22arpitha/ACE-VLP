import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page503Component } from './page503.component';

describe('Page503Component', () => {
  let component: Page503Component;
  let fixture: ComponentFixture<Page503Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Page503Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page503Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
