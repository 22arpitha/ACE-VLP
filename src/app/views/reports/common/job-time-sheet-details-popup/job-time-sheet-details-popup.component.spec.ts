import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTimeSheetDetailsPopupComponent } from './job-time-sheet-details-popup.component';

describe('JobTimeSheetDetailsPopupComponent', () => {
  let component: JobTimeSheetDetailsPopupComponent;
  let fixture: ComponentFixture<JobTimeSheetDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTimeSheetDetailsPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTimeSheetDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
