import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhConfigurationComponent } from './wfh-configuration.component';

describe('WfhConfigurationComponent', () => {
  let component: WfhConfigurationComponent;
  let fixture: ComponentFixture<WfhConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfhConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
