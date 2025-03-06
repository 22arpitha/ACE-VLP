import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefixSuffixListComponent } from './prefix-suffix-list.component';

describe('PrefixSuffixListComponent', () => {
  let component: PrefixSuffixListComponent;
  let fixture: ComponentFixture<PrefixSuffixListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrefixSuffixListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefixSuffixListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
