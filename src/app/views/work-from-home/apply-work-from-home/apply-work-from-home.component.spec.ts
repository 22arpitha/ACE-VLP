import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyWorkFromHomeComponent } from './apply-work-from-home.component';

describe('ApplyWorkFromHomeComponent', () => {
  let component: ApplyWorkFromHomeComponent;
  let fixture: ComponentFixture<ApplyWorkFromHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplyWorkFromHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyWorkFromHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
