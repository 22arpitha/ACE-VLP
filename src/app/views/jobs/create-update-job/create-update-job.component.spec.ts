import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateJobComponent } from './create-update-job.component';

describe('CreateUpdateJobComponent', () => {
  let component: CreateUpdateJobComponent;
  let fixture: ComponentFixture<CreateUpdateJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateJobComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
