import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyStandardplanComponent } from './buy-standardplan.component';

describe('BuyStandardplanComponent', () => {
  let component: BuyStandardplanComponent;
  let fixture: ComponentFixture<BuyStandardplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyStandardplanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyStandardplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
