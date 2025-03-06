import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericRemoveComponent } from './generic-remove.component';

describe('GenericRemoveComponent', () => {
  let component: GenericRemoveComponent;
  let fixture: ComponentFixture<GenericRemoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericRemoveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
