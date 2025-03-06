import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrefixSuffixComponent } from './create-prefix-suffix.component';

describe('CreatePrefixSuffixComponent', () => {
  let component: CreatePrefixSuffixComponent;
  let fixture: ComponentFixture<CreatePrefixSuffixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePrefixSuffixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePrefixSuffixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
