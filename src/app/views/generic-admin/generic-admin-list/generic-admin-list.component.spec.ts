import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericAdminListComponent } from './generic-admin-list.component';

describe('GenericAdminListComponent', () => {
  let component: GenericAdminListComponent;
  let fixture: ComponentFixture<GenericAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericAdminListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
