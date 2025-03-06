import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaggedComponent } from './flagged.component';

describe('FlaggedComponent', () => {
  let component: FlaggedComponent;
  let fixture: ComponentFixture<FlaggedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlaggedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlaggedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
