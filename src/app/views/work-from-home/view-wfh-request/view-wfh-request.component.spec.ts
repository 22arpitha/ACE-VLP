import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWfhRequestComponent } from './view-wfh-request.component';

describe('ViewWfhRequestComponent', () => {
  let component: ViewWfhRequestComponent;
  let fixture: ComponentFixture<ViewWfhRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewWfhRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewWfhRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
