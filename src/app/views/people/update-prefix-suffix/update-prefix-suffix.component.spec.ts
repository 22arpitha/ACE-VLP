import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePrefixSuffixComponent } from './update-prefix-suffix.component';

describe('UpdatePrefixSuffixComponent', () => {
  let component: UpdatePrefixSuffixComponent;
  let fixture: ComponentFixture<UpdatePrefixSuffixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatePrefixSuffixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePrefixSuffixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
