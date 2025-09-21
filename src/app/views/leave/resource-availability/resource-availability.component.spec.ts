import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceAvailabilityComponent } from './resource-availability.component';

describe('ResourceAvailabilityComponent', () => {
  let component: ResourceAvailabilityComponent;
  let fixture: ComponentFixture<ResourceAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceAvailabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
