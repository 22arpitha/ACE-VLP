import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDeleteComponent } from './generic-delete.component';

describe('GenericDeleteComponent', () => {
  let component: GenericDeleteComponent;
  let fixture: ComponentFixture<GenericDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericDeleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
