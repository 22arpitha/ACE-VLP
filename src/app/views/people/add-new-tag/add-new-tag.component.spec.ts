import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTagComponent } from './add-new-tag.component';

describe('AddNewTagComponent', () => {
  let component: AddNewTagComponent;
  let fixture: ComponentFixture<AddNewTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
