import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessToModulesComponent } from './access-to-modules.component';

describe('AccessToModulesComponent', () => {
  let component: AccessToModulesComponent;
  let fixture: ComponentFixture<AccessToModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessToModulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessToModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
