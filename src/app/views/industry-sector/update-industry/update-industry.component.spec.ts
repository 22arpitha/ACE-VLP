import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIndustryComponent } from './update-industry.component';

describe('UpdateIndustryComponent', () => {
  let component: UpdateIndustryComponent;
  let fixture: ComponentFixture<UpdateIndustryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateIndustryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateIndustryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
