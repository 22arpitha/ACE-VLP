import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompoffRequestComponent } from './add-compoff-request.component';

describe('AddCompoffRequestComponent', () => {
  let component: AddCompoffRequestComponent;
  let fixture: ComponentFixture<AddCompoffRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCompoffRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCompoffRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
