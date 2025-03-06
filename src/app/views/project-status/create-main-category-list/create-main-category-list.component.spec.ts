import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMainCategoryListComponent } from './create-main-category-list.component';

describe('CreateMainCategoryListComponent', () => {
  let component: CreateMainCategoryListComponent;
  let fixture: ComponentFixture<CreateMainCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMainCategoryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMainCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
