import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatusConfigComponent } from './project-status-config.component';

describe('ProjectStatusConfigComponent', () => {
  let component: ProjectStatusConfigComponent;
  let fixture: ComponentFixture<ProjectStatusConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectStatusConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStatusConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
