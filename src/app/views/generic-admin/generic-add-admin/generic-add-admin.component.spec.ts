import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericAddAdminComponent } from './generic-add-admin.component';

describe('GenericAddAdminComponent', () => {
  let component: GenericAddAdminComponent;
  let fixture: ComponentFixture<GenericAddAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericAddAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericAddAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
