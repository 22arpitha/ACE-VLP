import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallProductivityComponent } from './overall-productivity.component';

describe('OverallProductivityComponent', () => {
  let component: OverallProductivityComponent;
  let fixture: ComponentFixture<OverallProductivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverallProductivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
