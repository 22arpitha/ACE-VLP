import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleConfigComponent } from './people-config.component';

describe('PeopleConfigComponent', () => {
  let component: PeopleConfigComponent;
  let fixture: ComponentFixture<PeopleConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeopleConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeopleConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
