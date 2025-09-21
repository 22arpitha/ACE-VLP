import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffGrantComponent } from './comp-off-grant.component';

describe('CompOffGrantComponent', () => {
  let component: CompOffGrantComponent;
  let fixture: ComponentFixture<CompOffGrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompOffGrantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffGrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
