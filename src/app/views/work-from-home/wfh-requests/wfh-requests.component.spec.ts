import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhRequestsComponent } from './wfh-requests.component';

describe('WfhRequestsComponent', () => {
  let component: WfhRequestsComponent;
  let fixture: ComponentFixture<WfhRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
