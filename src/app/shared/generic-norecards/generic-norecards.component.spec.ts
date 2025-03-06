import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericNorecardsComponent } from './generic-norecards.component';

describe('GenericNorecardsComponent', () => {
  let component: GenericNorecardsComponent;
  let fixture: ComponentFixture<GenericNorecardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericNorecardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericNorecardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
