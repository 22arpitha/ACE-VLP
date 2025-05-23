import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericEditComponent } from './generic-edit.component';

describe('GenericEditComponent', () => {
  let component: GenericEditComponent;
  let fixture: ComponentFixture<GenericEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
