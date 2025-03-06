import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTaskConfigComponent } from './project-task-config.component';

describe('ProjectTaskConfigComponent', () => {
  let component: ProjectTaskConfigComponent;
  let fixture: ComponentFixture<ProjectTaskConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectTaskConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTaskConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
