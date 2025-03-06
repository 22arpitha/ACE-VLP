import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubCategoryListComponent } from './create-sub-category-list.component';

describe('CreateSubCategoryListComponent', () => {
  let component: CreateSubCategoryListComponent;
  let fixture: ComponentFixture<CreateSubCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSubCategoryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSubCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
