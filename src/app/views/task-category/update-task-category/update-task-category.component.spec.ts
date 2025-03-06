import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTaskCategoryComponent } from './update-task-category.component';

describe('UpdateTaskCategoryComponent', () => {
  let component: UpdateTaskCategoryComponent;
  let fixture: ComponentFixture<UpdateTaskCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateTaskCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTaskCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
