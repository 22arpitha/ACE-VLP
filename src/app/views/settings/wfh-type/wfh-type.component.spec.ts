import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhTypeComponent } from './wfh-type.component';

describe('WfhTypeComponent', () => {
  let component: WfhTypeComponent;
  let fixture: ComponentFixture<WfhTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
