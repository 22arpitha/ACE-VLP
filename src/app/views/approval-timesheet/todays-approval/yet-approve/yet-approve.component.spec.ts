import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YetApproveComponent } from './yet-approve.component';

describe('YetApproveComponent', () => {
  let component: YetApproveComponent;
  let fixture: ComponentFixture<YetApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YetApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YetApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
