import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrysectorConfigComponent } from './industrysector-config.component';

describe('IndustrysectorConfigComponent', () => {
  let component: IndustrysectorConfigComponent;
  let fixture: ComponentFixture<IndustrysectorConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndustrysectorConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrysectorConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
