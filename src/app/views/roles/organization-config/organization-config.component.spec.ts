import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationConfigComponent } from './organization-config.component';

describe('OrganizationConfigComponent', () => {
  let component: OrganizationConfigComponent;
  let fixture: ComponentFixture<OrganizationConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
