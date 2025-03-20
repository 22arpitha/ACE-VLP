import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsOfGroupComponent } from './clients-of-group.component';

describe('ClientsOfGroupComponent', () => {
  let component: ClientsOfGroupComponent;
  let fixture: ComponentFixture<ClientsOfGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsOfGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsOfGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
