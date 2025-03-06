import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWelcomeMsgComponent } from './user-welcome-msg.component';

describe('UserWelcomeMsgComponent', () => {
  let component: UserWelcomeMsgComponent;
  let fixture: ComponentFixture<UserWelcomeMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserWelcomeMsgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWelcomeMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
