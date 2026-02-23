import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCompOffListComponent } from './user-comp-off-list.component';

describe('UserCompOffListComponent', () => {
  let component: UserCompOffListComponent;
  let fixture: ComponentFixture<UserCompOffListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCompOffListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCompOffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
