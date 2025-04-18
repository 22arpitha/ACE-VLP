import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualitativeProductivityComponent } from './qualitative-productivity.component';

describe('QualitativeProductivityComponent', () => {
  let component: QualitativeProductivityComponent;
  let fixture: ComponentFixture<QualitativeProductivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualitativeProductivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualitativeProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
