import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YetToApproveComponent } from './yet-to-approve.component';

describe('YetToApproveComponent', () => {
  let component: YetToApproveComponent;
  let fixture: ComponentFixture<YetToApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YetToApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YetToApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
